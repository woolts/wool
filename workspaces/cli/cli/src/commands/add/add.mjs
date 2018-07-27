import fs from 'fs';
import path from 'path';
import util from 'util';
import * as colors from 'wool/cli-colors';
import * as cliQuestions from 'wool/cli-questions';
import * as semver from 'wool/semver';
import {
  localPackagesUrl,
  readPackageConfig,
  readActivePackageConfig,
  writeActivePackageConfig,
  woolPath,
} from 'wool/utils';

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
  const possibleVersions = [
    ...Object.keys(localVersions),
    ...Object.values(registryVersions).reduce(
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

export default async function add({ args }) {
  // TODO: use all names
  const specifiers = [args.name];

  const woolConfig = await readActivePackageConfig();

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
  const { confirmInstall } = await cliQuestions.ask([
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
  const newDependencies = woolConfig.dependencies || {};
  plan.forEach(dep => {
    newDependencies[dep.name] = dep.constraint;
  });
  const sortedDependencyNames = Object.keys(newDependencies).sort();
  woolConfig.dependencies = {};
  sortedDependencyNames.forEach(sorted => {
    woolConfig.dependencies[sorted] = newDependencies[sorted];
  });

  await writeActivePackageConfig(woolConfig);
  console.log(colors.green('Installed.'));
  console.log('');
  console.log(
    `${woolPath} usage ${colors.magenta('increased')} by ${colors.magenta(
      '?kb',
    )} to ${colors.white('?mb')}`,
  );
}
