import path from 'path';
import * as semver from 'wool/semver';

import {
  readActivePackageConfig,
  readActivePackageVersionLock,
  writeActivePackageConfig,
  writeActivePackageVersionLock,
} from '../../utils';

export default async function run({ args }) {
  const config = await readActivePackageConfig();

  if (!config.version) {
    throw new Error(`${config.name || 'Package'} does not have a version.`);
  }

  const version = args.version || (await inferVersion(config));
  const comparison = semver.compareVersions(version, config.version);

  if (comparison === 0) {
    console.log(`${config.name} is already at the version ${version}`);
    return;
  }

  if (comparison < 0) {
    console.log(
      `You can not reduce the version of ${config.name} from ${
        config.version
      } to ${version}`,
    );
    return;
  }

  const exported = await discoverExports(config);

  await writeActivePackageConfig({
    ...config,
    version,
  });
  await writeActivePackageVersionLock({
    version,
    exports: exported,
  });

  console.log(`Updated ${config.name} to ${version}`);
}

async function inferVersion(config) {
  let versionLock;
  try {
    versionLock = await readActivePackageVersionLock();
  } catch (err) {
    if (config.version === '0.0.0') return '0.1.0';
    throw new Error(
      `Could not find wool.version in package, please provide a version manually.`,
    );
  }

  const newExports = await discoverExports(config);

  if (JSON.stringify(newExports) !== JSON.stringify(versionLock.exports)) {
    return semver.increment(config.version, semver.MINOR);
  }

  return config.version;
}

function discoverExports(config) {
  return Promise.resolve({});

  // TODO: create an ast (acornjs/acorn ?) and find all export tokens
  return import(path.resolve(process.cwd(), config.entry));
}
