import * as fs from 'fs';
import * as path from 'path';
import * as colors from 'wool/colors';
import * as cliQuestions from 'wool/cli-questions';
import { catalogue as errors } from 'wool/errors';
import { spawn } from 'wool/process';
import { download, request } from 'wool/request';
import * as semver from 'wool/semver';
import {
  ResolvedSpecifier,
  WoolCommonConfig,
  bisect,
  findOr,
  has,
  get,
  localPackagesPath,
  localPackagesUrl,
  map,
  readActivePackageConfig,
  readActivePackageLock,
  readPackageConfig,
  readPackageLock,
  some,
  uniqueBy,
  urlToPath,
  writeActivePackageConfig,
  writeActivePackageLock,
  writePackageConfig,
  writePackageLock,
} from 'wool/utils';

import { multiSpinner, spinner } from '../spinners';

interface Plan {
  install: {
    direct: Array<ResolvedSpecifier>;
    indirect: Array<ResolvedSpecifier>;
    all: Array<ResolvedSpecifier>;
  };
  move: Array<string>;
  invalid: Array<string>;
  unresolved: Array<UnresolvedSpecifier>;
}

interface UnresolvedSpecifier {
  unresolved: true;
  name: string;
  parent: string;
  constraint: string;
}

export default async function add({ args, options }) {
  let woolConfig;
  let woolLock;

  if (options.workspace) {
    woolConfig = await readPackageConfig(options.workspace);
    woolLock = await readPackageLock(options.workspace);
  } else {
    woolConfig = await readActivePackageConfig();
    woolLock = await readActivePackageLock();
  }

  // TODO: use all names
  const requestedSpecifiers: Array<string> = [args.name];

  // TODO: validate specifiers against workspace and ancestors

  // Create plan from new specifiers of direct and indirect
  const plan = await createPlan(woolConfig, woolLock, requestedSpecifiers);

  console.log('');

  // Get confirmation from user
  const confirmContinue = await confirmWithUser(plan);
  if (!confirmContinue) return;

  // Download and unzip any new packages
  await downloadPackages(plan);

  // Update wool.json and wool.lock
  await updateConfigs(options, woolConfig, woolLock, plan);

  console.log('');
  console.log("I've updated your wool.json and wool.lock files.");

  const totalSize = plan.install.all.reduce((sum, s) => sum + (s.size || 0), 0);

  console.log('');
  console.log(
    `Installed packages ${colors.magenta('increased')} by ${colors.magenta(
      formatSize(totalSize),
    )} to ${colors.white(formatSize(0))}.`,
  );
  console.log(`Run ${colors.blue('wool stats')} for more information.`);
}

async function createPlan(
  woolConfig,
  woolLock,
  requestedSpecifiers: Array<string>,
): Promise<Plan> {
  const [newSpecifiers, existingSpecifiers] = bisect(
    s => !has(s, woolLock),
    requestedSpecifiers,
  ) as [Array<string>, Array<string>]; // TODO: this shouldn't be necessary, check bisect

  const [valid, invalid] = bisect(isValidName, newSpecifiers) as [
    Array<string>,
    Array<string>
  ];

  const [all, unresolved] = bisect(
    s => !s.unresolved,
    await resolveSpecifiers(woolConfig, valid),
  ) as [Array<ResolvedSpecifier>, Array<UnresolvedSpecifier>];
  // TODO: technically this is invalid as they have to be of the same type

  unresolved.sort(sortByName);
  all.sort(sortByName);

  const [direct, indirect] = bisect(
    s => newSpecifiers.includes(s.name),
    all,
  ) as [Array<ResolvedSpecifier>, Array<ResolvedSpecifier>];

  const move = [] as Array<string>;
  existingSpecifiers.forEach(s => {
    if (has(s, woolConfig.dependencies.indirect)) {
      move.push(s);
    }
  });

  return {
    install: {
      direct,
      indirect,
      all,
    },
    invalid,
    move,
    unresolved,
  };
}

async function confirmWithUser(plan: Plan) {
  // Invalid
  plan.invalid.forEach(name => {
    console.log(
      colors.red(`I can not add ${name} as it is not a valid package name.`),
    );
  });
  if (plan.invalid.length > 0) console.log('');

  // Unresolved
  if (plan.unresolved.length > 0) {
    console.error(errors.addUnresolvedPackage({ unresolved: plan.unresolved }));
    return;
  }

  if (plan.install.all.length === 0) {
    console.log('There is nothing new to add 👍');
    return;
  }

  // Valid
  if (plan.install.direct.length > 0) {
    console.log(
      `To add ${colors.cyan(
        // TODO: fix types of map
        // toSentence(map('name', plan.install.direct)),
        toSentence(plan.install.direct.map(d => d.name)),
      )} I would like to install the following packages:`,
    );
    console.log('');

    plan.install.all.forEach(s => {
      console.log(
        `    ${colors.cyan(s.name)}  ${colors.blue(s.version)}  ${
          s.constraint
        }  ${
          s.registry === 'local'
            ? '(already downloaded)'
            : colors.white(s.registry)
        }`,
      );
    });
    console.log('');
  }

  const totalSize = plan.install.all.reduce((sum, s) => sum + (s.size || 0), 0);
  const hasNonLocal = some(s => s.registry !== 'local', plan.install.all);
  const hasUnknown = some(
    s => s.registry !== 'local' && s.size === null,
    plan.install.all,
  );

  if (!hasNonLocal) {
    console.log(
      "You've already downloaded all these packages before, this will add " +
        'nothing to your dependencies 👍',
    );
  } else if (hasUnknown && totalSize === 0) {
    console.log(
      colors.yellow(
        "I'm not sure how much data this will add to your dependencies.",
      ),
    );
  } else if (hasUnknown) {
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

  // Move
  if (plan.move.length > 0) {
    console.log(
      'You already have these packages installed indirectly, I will make ' +
        'them direct dependencies:\n',
    );
    plan.move.forEach(s => {
      console.log(`    ${colors.cyan(s)}`);
    });
    console.log('');
  }

  // May I install these for you?
  const { confirmContinue }: any = await cliQuestions.ask([
    {
      type: 'confirm',
      name: 'confirmContinue',
      message: 'Does that look good?',
    },
  ]);
  console.log('');

  return confirmContinue;
}

function downloadPackages(plan: Plan) {
  const downloads = plan.install.all
    .filter(s => s.registry !== 'local')
    .map(async s => {
      const dest = new URL(
        `../bundles/${s.name.replace('/', '_')}_${s.version}.tar.gz`,
        localPackagesUrl,
      );
      await spawn('mkdir', ['-p', path.dirname(urlToPath(dest))]);
      await download(
        new URL(`http://localhost:7777/packages/${s.name}/${s.version}/bundle`),
        dest,
      );

      // TODO: .pipe(zlib.createGunzip())
      await spawn('tar', ['-xzf', urlToPath(dest), '-C', localPackagesPath]);
    });

  multiSpinner(
    downloads,
    index => {
      const pkg = plan.install.all[index];
      return `⏬ Downloading ${colors.cyan(pkg.name)} at ${colors.blue(
        pkg.version,
      )}`;
    },
    index => {
      const pkg = plan.install.all[index];
      return `✅ Downloaded ${colors.cyan(pkg.name)} at ${colors.blue(
        pkg.version,
      )}`;
    },
  );

  return Promise.all(downloads);
}

async function updateConfigs(options, woolConfig, woolLock, plan: Plan) {
  const newDependencies = woolConfig.dependencies || {};
  newDependencies.direct = newDependencies.direct || {};
  newDependencies.indirect = newDependencies.indirect || {};

  plan.install.direct.forEach((s: ResolvedSpecifier) => {
    newDependencies.direct[s.name] = s.constraint;
  });

  plan.move.forEach(name => {
    newDependencies.direct[name] = woolConfig.dependencies.indirect[name];
    delete newDependencies.indirect[name];
  });

  plan.install.indirect.forEach((s: ResolvedSpecifier) => {
    newDependencies.indirect[s.name] = s.constraint;
  });

  const byName = {};
  plan.install.all.forEach(s => {
    byName[s.name] = s;
  });

  const sortedLockNames = [
    ...Object.keys(byName),
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
  sortedLockNames.forEach(name => {
    if (byName[name]) {
      newLock[name] = {
        name,
        version: byName[name].version,
        constraint: byName[name].constraint,
        registry: byName[name].registry,
        size: byName[name].size,
      };
    } else {
      newLock[name] = woolLock[name];
    }
  });

  if (options.workspace) {
    await writePackageConfig(options.workspace, woolConfig);
    await writePackageLock(options.workspace, newLock);
  } else {
    await writeActivePackageConfig(woolConfig);
    await writeActivePackageLock(newLock);
  }
}

// --- Resolve Specifiers ---

async function resolveSpecifiers(
  woolConfig: WoolCommonConfig,
  specifiers: Array<string>,
  init = [],
): Promise<Array<ResolvedSpecifier | UnresolvedSpecifier>> {
  return uniqueBy(
    'name',
    await specifiers
      .map(specifier => resolveSpecifierRecursively(woolConfig, specifier))
      .reduce(
        (acc, next) => Promise.all([acc, next]).then(([a, n]) => a.concat(n)),
        Promise.resolve(init),
      ),
  ) as Array<ResolvedSpecifier | UnresolvedSpecifier>;

  // TODO: memoise specifier lookup
  // TODO: don't duplicate a direct into indirect
}

async function resolveSpecifierRecursively(
  woolConfig: WoolCommonConfig,
  name: string,
): Promise<Array<ResolvedSpecifier | UnresolvedSpecifier>> {
  let self;
  let dependencies;
  try {
    [self, dependencies] = await resolveSpecifier(woolConfig, name);
  } catch (_) {
    return [
      { unresolved: true, name, parent: 'unknown', constraint: 'unknown' },
    ];
  }
  return resolveSpecifiers(woolConfig, dependencies || [], [self]);
}

async function resolveSpecifier(
  woolConfig,
  name,
): Promise<[ResolvedSpecifier, Array<string>]> {
  // a. Search each registry in sequence for the specifier
  const localVersions = searchLocalPackages(name);
  const registryVersions = {};

  let registrySearchWith = '';

  const registrySearchPromise = Promise.all(
    (woolConfig.registries || []).map(registry => {
      registryVersions[registry] = [];
      registrySearchWith = registry;

      // i. http request, search registry for name, get versions
      return request(`${registry}/packages/${name}`, { json: true }).then(
        res => {
          if (res.statusCode !== 200) return res;

          if (res.body.versions) {
            registryVersions[registry] = res.body.versions;
          }

          return res;
        },
      );
    }),
  );

  let possibleVersions = [];

  spinner(
    registrySearchPromise,
    () =>
      `🔍 Resolving ${colors.cyan(name)} with ${colors.white(
        registrySearchWith,
      )}`,
    responses => {
      const any200 = some(r => r.statusCode === 200, responses);
      if (!any200) {
        return `❌ Failed ${colors.red(name)}`;
      }
      return `📦 Resolved ${colors.cyan(name)}`;
    },
  );

  await registrySearchPromise;

  // b. Find the highest version that satisifies the constraints
  const objectValues = obj => Object.keys(obj).map(key => obj[key]);
  possibleVersions = [
    ...Object.keys(localVersions),
    ...objectValues(registryVersions).reduce(
      (acc, versions) => [...acc, ...map(get('number'), versions)],
      [],
    ),
  ];

  if (possibleVersions.length === 0) {
    throw new Error(`No possible versions found for ${name}`);
  }

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
              // TODO: fix types of map
              // map(get('number'), registryVersions[registry]),
              registryVersions[registry].map(r => r.number),
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

  return [
    {
      name,
      version: maxVersion,
      constraint: constraint,
      registry: maxVersionFrom,
      size: maxVersionSize,
    },
    dependencies,
  ];
}

function searchLocalPackages(name: string): { [key: string]: URL } {
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
}

function sortByName(left: { name: string }, right: { name: string }) {
  if (left.name === right.name) return 0;
  return left.name < right.name ? -1 : 1;
}

function toSentence(xs: Array<string>) {
  if (xs.length === 0) return '';
  if (xs.length === 1) return xs[0];
  return xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
}

function isValidName(specifier) {
  // https://regex101.com/r/s7UWNw/1
  return /^[a-z0-1_-]+\/[a-z0-1_-]+$/.test(specifier);
}

function formatSize(size: number): string {
  if (size < 1024) {
    return `${size} bytes`;
  }

  return `${Math.round(size / 102.4) / 10}kb`;
}
