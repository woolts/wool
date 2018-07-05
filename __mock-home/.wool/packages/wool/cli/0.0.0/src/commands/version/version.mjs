import * as semver from 'wool/semver';

import { readActivePackageConfig, writeActivePackageConfig } from '../../utils';

export default async function run({ args }) {
  const config = await readActivePackageConfig();

  if (!config.version) {
    throw new Error(`${config.name || 'Package'} does not have a version.`);
  }

  const version = args.version || discoverVersion();
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

  await writeActivePackageConfig({
    ...config,
    version,
  });

  console.log(`Updated ${config.name} to ${version}`);
}

function discoverVersion() {
  return '0.0.0';
}
