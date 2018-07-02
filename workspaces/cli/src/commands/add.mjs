import fs from 'fs';
import path from 'path';
import util from 'util';
import * as inquirer from 'wool/inquirer';
import * as semver from 'wool/semver';

const woolUrl = new URL(`file://${process.env.WOOL_PATH}`);
const localPackagesUrl = new URL('./packages/', woolUrl);

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

const readPackageConfig = async url => {
  try {
    return JSON.parse(
      await util.promisify(fs.readFile)(
        new URL(path.join(`file://${url}`, 'wool.json')),
      ),
    );
  } catch (err) {
    // if (err.code !== 'ENOENT')
    throw err;
  }
};

const writePackageConfig = async (url, config) => {
  try {
    await util.promisify(fs.writeFile)(
      new URL(path.join(`file://${url}`, 'wool.json')),
      JSON.stringify(config, null, 2),
    );
  } catch (err) {
    // if (err.code !== 'ENOENT')
    throw err;
  }
};

export default async function add(...specifiers) {
  // 1. Find the available registries, including $WOOL_HOME

  // 2. Loop the specifiers
  const plan = specifiers.map(name => {
    if (!isValidName(name)) {
      return {
        name,
        invalid: true,
      };
    }

    // a. Search each registry in sequence for the specifier
    const localVersions = searchLocalPackages(name);

    // b. Find the highest version that satisifies the constraints
    const maxVersion = semver.findMaxVersion(Object.keys(localVersions));
    const constraint = semver.toSafeConstraintFromVersion(maxVersion);

    // c. If specifier found, gather into collection of found specifiers
    return {
      name,
      constraint,
      localVersions,
      registry: false,
    };
  });

  const validPlan = plan.filter(dep => !dep.invalid);
  const invalidPlan = plan.filter(dep => dep.invalid);
  invalidPlan.forEach(dep => {
    console.log(`I can not add ${dep.name} as it is not a valid package name.`);
  });
  if (invalidPlan.length > 0) console.log('');

  // 3. Inform user of installation plan
  const planNames = validPlan.map(dep => dep.name);

  console.log(
    `To add ${toSentence(
      planNames,
    )} I would like to install the following packages:`,
  );
  console.log('');
  plan.forEach(dep => {
    console.log(`    ${dep.name}  ${dep.constraint}`);
  });
  console.log('');
  console.log('Adding a total of ?kb to your dependencies.');
  console.log('');
  const { confirmInstall } = await inquirer.inquire([
    {
      type: 'confirm',
      name: 'confirmInstall',
      message: 'May I install these for you?',
    },
  ]);
  console.log('');

  // a. If user rejects plan, abort
  if (!confirmInstall) {
    console.log('Cancel');
    return;
  }

  // b. If user accepts plan, install packages into $WOOL_HOME and update wool.json
  const woolConfig = await readPackageConfig(process.cwd());
  woolConfig.dependencies = woolConfig.dependencies || {};
  plan.forEach(dep => {
    woolConfig.dependencies[dep.name] = dep.constraint;
  });
  await writePackageConfig(process.cwd(), woolConfig);
  console.log('Installed.');
}
