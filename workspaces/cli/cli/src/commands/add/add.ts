import * as fs from 'fs';
import * as colors from 'wool/colors';
import * as cliQuestions from 'wool/cli-questions';
import * as semver from 'wool/semver';
import {
  localPackagesUrl,
  readActivePackageConfig,
  readActivePackageLock,
  readPackageConfig,
  readPackageLock,
  writeActivePackageConfig,
  writeActivePackageLock,
  writePackageConfig,
  writePackageLock,
  woolPath,
} from 'wool/utils';
import { stringify } from 'querystring';

const isValidName = specifier => {
  // https://regex101.com/r/s7UWNw/1
  return /^[a-z0-1_-]+\/[a-z0-1_-]+$/.test(specifier);
};

const fromOffline = name => {};

const searchLocalPackages = name => {
  const [searchNamespace, searchPackage] = name.split('/');

  const namespaces = fs.readdirSync(localPackagesUrl);
  if (!namespaces.includes(searchNamespace)) return;

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

const resolveSpecifier = async (woolConfig, name) => {
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

  (woolConfig.registries || []).forEach(registry => {
    registryVersions[registry] = {};
    // i. http request, search registry for name, get versions
  });

  // b. Find the highest version that satisifies the constraints
  const objectValues = obj => Object.keys(obj).map(key => obj[key]);
  const possibleVersions = [
    ...Object.keys(localVersions),
    ...objectValues(registryVersions).reduce(
      (acc, registry) => [...acc, ...Object.keys(registry)],
      [],
    ),
  ];
  const maxVersion = semver.findMaxVersion(possibleVersions);
  const constraint = semver.toSafeConstraintFromVersion(maxVersion);

  let dependencies = [];
  if (Object.keys(localVersions).includes(maxVersion)) {
    const maxVersionConfig = await readPackageConfig(
      new URL(`${name}/${maxVersion}/`, localPackagesUrl),
    );
    dependencies = Object.keys(maxVersionConfig.dependencies);
  }

  // c. If specifier found, gather into collection of found specifiers
  return {
    name,
    constraint,
    maxVersion,
    dependencies,
    localVersions,
    registryVersions,
  };
};

const resolveSpecifierRecursively = async (woolConfig, name) => {
  const self = await resolveSpecifier(woolConfig, name);
  return resolveSpecifiers(woolConfig, self.dependencies, [self]);
};

const resolveSpecifiers = (woolConfig, specifiers, init = []) =>
  specifiers
    .map(specifier => resolveSpecifierRecursively(woolConfig, specifier))
    .reduce(async (acc, next) => [...(await acc), ...(await next)], init);

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
    console.log(`    ${colors.cyan(dep.name)}  ${colors.blue(dep.constraint)}`);
  });
  console.log('');
  console.log(`Adding a total of ${colors.white('?kb')} to your dependencies.`);
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

  console.log(colors.green('Installed.'));
  console.log('');
  console.log(
    `${woolPath} usage ${colors.magenta('increased')} by ${colors.magenta(
      '?kb',
    )} to ${colors.white('?mb')}`,
  );
}
