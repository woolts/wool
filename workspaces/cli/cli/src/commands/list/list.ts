import * as fs from 'fs';
import * as path from 'path';
import * as colors from 'wool/cli-colors';
import {
  localPackagesPath,
  readActivePackageConfig,
  readActivePackageLock,
} from 'wool/utils';

export default async function run({ options }) {
  let config;
  try {
    config = await readActivePackageConfig();
  } catch (err) {
    options.global = true;
  }

  if (!options.global && config) {
    return listLocal(config);
  }

  return listGlobal();
}

async function listLocal(config) {
  if (!config.dependencies || Object.keys(config.dependencies).length === 0) {
    console.log('You have no dependencies in this project.');
    return;
  }

  console.log(
    'These are the packages installed on your system and used by this project:\n',
  );

  const lock = await readActivePackageLock();
  const configNamespaces = Object.keys(config.dependencies).map(
    d => d.split('/')[0],
  );

  const namespaces = fs
    .readdirSync(localPackagesPath)
    .filter(namespace => configNamespaces.includes(namespace));

  namespaces.forEach(namespace => {
    const packages = fs
      .readdirSync(path.join(localPackagesPath, namespace))
      .filter(pkg =>
        Object.keys(config.dependencies).includes(`${namespace}/${pkg}`),
      );

    console.log(`  ${colors.white(namespace)}`);

    packages.forEach(pkg => {
      const versions = fs.readdirSync(
        path.join(localPackagesPath, namespace, pkg),
      );
      console.log(
        `  ${colors.gray(namespace)}/${colors.cyan(pkg)} at ${versions
          .map(
            v =>
              lock[`${namespace}/${pkg}`] &&
              v === lock[`${namespace}/${pkg}`].version
                ? colors.blue(v)
                : v,
          )
          .join(', ')}`,
      );
    });

    console.log('');
  });
}

function listGlobal() {
  console.log(
    'These are the packages installed and available on your system:\n',
  );

  const namespaces = fs.readdirSync(localPackagesPath);
  namespaces.forEach(namespace => {
    console.log(`  ${colors.white(namespace)}`);

    const packages = fs.readdirSync(path.join(localPackagesPath, namespace));
    packages.forEach(pkg => {
      const versions = fs.readdirSync(
        path.join(localPackagesPath, namespace, pkg),
      );
      console.log(
        `  ${colors.gray(namespace)}/${colors.cyan(pkg)} at ${versions
          .map(v => colors.blue(v))
          .join(', ')}`,
      );
    });

    console.log('');
  });
}
