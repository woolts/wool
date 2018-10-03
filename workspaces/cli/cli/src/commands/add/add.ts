import * as fs from 'fs';
import * as path from 'path';
import * as colors from 'wool/colors';
import * as cliQuestions from 'wool/cli-questions';
import request from 'wool/request';
import * as semver from 'wool/semver';
import {
  WoolCommonConfig,
  findOr,
  get,
  localPackagesPath,
  localPackagesUrl,
  map,
  readActivePackageConfig,
  readActivePackageLock,
  readPackageConfig,
  readPackageLock,
  some,
  writeActivePackageConfig,
  writeActivePackageLock,
  writePackageConfig,
  writePackageLock,
  woolPath,
} from 'wool/utils';

import { multiSpinner } from '../spinners';

const isValidName = specifier => {
  // https://regex101.com/r/s7UWNw/1
  return /^[a-z0-1_-]+\/[a-z0-1_-]+$/.test(specifier);
};

const fromOffline = name => {};

const searchLocalPackages = name => {
  const [searchNamespace, searchPackage] = name.split('/');

  const namespaces = fs.readdirSync(localPackagesUrl);
  if (!namespaces.includes(searchNamespace)) return {};

  const packageUrl = new URL(
    `./${searchNamespace}/${searchPackage}`,
    localPackagesUrl,
  );
  const versions = fs.readdirSync(packageUrl);

  const versionUrls = {};

  versions.forEach(v => {
    versionUrls[v] = new URL(`./${v}/`, packageUrl);
  });

  return versionUrls;
};

const toSentence = array => {
  if (array.length === 0) return '';
  if (array.length === 1) return array[0];
  return array.slice(0, -1).join(', ') + ' and ' + array[array.length - 1];
};

const resolveSpecifier = async (woolConfig, name): Promise<any> => {
  // z. If this is a directory, remove the existing version and install it directly
  // if (specifier === '.') {
  //   // TODO: all directories
  //   return {
  //     name: woolConfig.name,
  //     version: woolConfig.version,
  //     local: true,
  //   };
  // }

  if (!isValidName(name)) {
    return {
      name,
      invalid: true,
    };
  }

  // a. Search each registry in sequence for the specifier
  const localVersions = searchLocalPackages(name);
  const registryVersions = {};

  // TODO: add spinner for searching registries

  await Promise.all(
    (woolConfig.registries || []).map(async registry => {
      registryVersions[registry] = [];
      // i. http request, search registry for name, get versions
      await request(`${registry}/packages/${name}`, { json: true }).then(
        res => {
          if (res.statusCode !== 200) return;

          if (res.body.versions) {
            registryVersions[registry] = res.body.versions;
          }
        },
      );
    }),
  );

  // b. Find the highest version that satisifies the constraints
  const objectValues = obj => Object.keys(obj).map(key => obj[key]);
  const possibleVersions = [
    ...Object.keys(localVersions),
    ...objectValues(registryVersions).reduce(
      (acc, versions) => [...acc, ...map(get('number'), versions)],
      [],
    ),
  ];
  const maxVersion = semver.findMaxVersion(possibleVersions);
  const constraint = semver.toSafeConstraintFromVersion(maxVersion);

  const locationMaxVersions = [
    {
      location: 'local',
      version:
        Object.keys(localVersions).length > 0
          ? semver.findMaxVersion(Object.keys(localVersions))
          : false,
    },
    ...Object.keys(registryVersions).map(registry => ({
      location: registry,
      version:
        registryVersions[registry].length > 0
          ? semver.findMaxVersion(
              map(get('number'), registryVersions[registry]),
            )
          : false,
    })),
  ];

  const maxVersionFrom = (findOr(
    ({ version }) => version === maxVersion,
    { location: 'local' } as any,
    locationMaxVersions,
  ) as any).location;
  const maxVersionSize = (findOr(
    ({ number }) => number === maxVersion,
    { size: null } as any,
    registryVersions[maxVersionFrom],
  ) as any).size;

  let dependencies = [];
  if (Object.keys(localVersions).includes(maxVersion)) {
    const maxVersionConfig = await readPackageConfig(
      new URL(`${name}/${maxVersion}/`, localPackagesUrl),
    );
    dependencies = [
      ...Object.keys(maxVersionConfig.dependencies.direct || {}),
      ...Object.keys(maxVersionConfig.dependencies.indirect || {}),
    ];
  }

  // c. If specifier found, gather into collection of found specifiers
  return {
    name,
    constraint,
    maxVersion,
    maxVersionFrom,
    maxVersionSize,
    dependencies,
    localVersions,
    registryVersions,
  };
};

const resolveSpecifierRecursively = async (
  woolConfig: WoolCommonConfig,
  name,
) => {
  const self = await resolveSpecifier(woolConfig, name);
  return resolveSpecifiers(woolConfig, self.dependencies, [self]);
};

const resolveSpecifiers = async (woolConfig, specifiers, init = []) => {
  const ss = await specifiers
    .map(specifier => resolveSpecifierRecursively(woolConfig, specifier))
    .reduce(async (acc, next) => [...(await acc), ...(await next)], init);

  // TODO: memoise specifier lookup
  // TODO: don't duplicate a direct into indirect

  // TODO: do better
  return ss.reduce((acc, next) => {
    let exists = false;
    acc.forEach(s => {
      if (s.name === next.name) {
        exists = true;
      }
    });
    if (!exists) return acc.concat(next);
    return acc;
  }, []);
};

export default async function add({ args, options }) {
  // TODO: use all names
  const specifiers = [args.name];

  let woolConfig;
  let woolLock;

  if (options.workspace) {
    woolConfig = await readPackageConfig(options.workspace);
    woolLock = await readPackageLock(options.workspace);
  } else {
    woolConfig = await readActivePackageConfig();
    woolLock = await readActivePackageLock();
  }

  // 1. Find the available registries, including $WOOL_HOME

  // 2. Loop the specifiers
  const plan = (await resolveSpecifiers(woolConfig, specifiers, [])).sort(
    (left, right) => {
      if (left.name === right.name) return 0;
      return left.name < right.name ? -1 : 1;
    },
  );

  const validPlan = plan.filter(dep => !dep.invalid);
  const invalidPlan = plan.filter(dep => dep.invalid);
  invalidPlan.forEach(dep => {
    console.log(
      colors.red(
        `I can not add ${dep.name} as it is not a valid package name.`,
      ),
    );
  });
  if (invalidPlan.length > 0) console.log('');

  // 3. Inform user of installation plan
  console.log(
    `To add ${colors.cyan(
      toSentence(specifiers),
    )} I would like to install the following packages:`,
  );
  console.log('');
  plan.forEach(dep => {
    console.log(
      `    ${colors.cyan(dep.name)}  ${colors.blue(
        dep.constraint,
      )}  ${colors.white(dep.maxVersionFrom)}`,
    );
  });
  console.log('');

  const totalSize = plan.reduce(
    (sum, dep) => sum + (dep.maxVersionSize || 0),
    0,
  );
  const hasUnknown = some(dep => dep.maxVersionSize === null, plan);

  if (hasUnknown) {
    console.log(
      `Adding at least ${colors.white(
        `${formatSize(totalSize)}`,
      )} to your dependencies, ${colors.yellow(
        'though the total is unknown',
      )}.`,
    );
  } else {
    console.log(
      `Adding a total of ${colors.white(
        `${formatSize(totalSize)}`,
      )} to your dependencies.`,
    );
  }
  console.log('');
  const { confirmInstall }: any = await cliQuestions.ask([
    {
      type: 'confirm',
      name: 'confirmInstall',
      message: 'May I install these for you?',
    },
  ]);
  console.log('');

  // a. If user rejects plan, abort
  if (!confirmInstall) {
    return;
  }

  // b. If user accepts plan, install packages into $WOOL_HOME and update wool.json

  // b.i. Update wool.json & wool.lock
  const keyedPlan = {};
  const newDependencies = woolConfig.dependencies || {};
  newDependencies.direct = newDependencies.direct || {};
  newDependencies.indirect = newDependencies.indirect || {};

  plan.forEach(dep => {
    keyedPlan[dep.name] = dep;
    if (specifiers.includes(dep.name)) {
      newDependencies.direct[dep.name] = dep.constraint;
    } else {
      newDependencies.indirect[dep.name] = dep.constraint;
    }
  });

  const sortedLockNames = [
    ...Object.keys(keyedPlan),
    ...Object.keys(woolLock),
  ].sort();
  const sortedDirectDependencyNames = Object.keys(
    newDependencies.direct,
  ).sort();
  const sortedIndirectDependencyNames = Object.keys(
    newDependencies.indirect,
  ).sort();

  woolConfig.dependencies = {
    direct: {},
    indirect: {},
  };

  sortedDirectDependencyNames.forEach(sorted => {
    woolConfig.dependencies.direct[sorted] = newDependencies.direct[sorted];
  });
  sortedIndirectDependencyNames.forEach(sorted => {
    woolConfig.dependencies.indirect[sorted] = newDependencies.indirect[sorted];
  });

  const newLock = {};
  sortedLockNames.forEach(sorted => {
    if (keyedPlan[sorted]) {
      newLock[sorted] = {
        version: keyedPlan[sorted].maxVersion,
        constraint: keyedPlan[sorted].constraint,
      };
    } else {
      newLock[sorted] = woolLock[sorted];
    }
  });

  if (options.workspace) {
    await writePackageConfig(options.workspace, woolConfig);
    await writePackageLock(options.workspace, newLock);
  } else {
    await writeActivePackageConfig(woolConfig);
    await writeActivePackageLock(newLock);
  }

  // b.ii. Download and unpack new packages
  const pendings = [];

  await Promise.all(
    plan.map(async dep => {
      const localVersionPath = path.join(
        localPackagesPath,
        dep.name,
        newLock[dep.name].version,
      );
      await readPackageConfig(localVersionPath).catch(err => {
        // TODO: Download and unzip
        pendings.push(
          new Promise(resolve =>
            setTimeout(resolve, 1000 + Math.random() * 1000),
          ),
        );
      });
    }),
  );

  const spinnersInterval = multiSpinner(
    pendings,
    index => {
      const name = plan[index].name;
      return `⏬ Downloading ${colors.cyan(name)} at ${colors.blue(
        newLock[name].version,
      )}`;
    },
    index => {
      const name = plan[index].name;
      return `✅ Downloaded ${colors.cyan(name)} at ${colors.blue(
        newLock[name].version,
      )}`;
    },
  );

  await Promise.all(pendings)
    .then(() => new Promise(resolve => setTimeout(resolve, 80)))
    .then(() => {
      clearInterval(spinnersInterval);
    });

  console.log('');
  console.log(
    `Installed packages ${colors.magenta('increased')} by ${colors.magenta(
      formatSize(totalSize),
    )} to ${colors.white(formatSize(0))}.`,
  );
  console.log(`Run ${colors.blue('wool stats')} for more information.`);
}

function formatSize(size: number): string {
  if (size < 1024) {
    return `${size} bytes`;
  }

  return `${Math.round(size / 102.4) / 10}kb`;
}
