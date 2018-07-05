import semver from 'wool/semver';

import { readActivePackageConfig, writeActivePackageConfig } from '../../utils';

export default async function run({ arguments, options }) {
  const config = await readActivePackageConfig();
  const version = arguments.version || discoverVersion();

  const comparison = semver.compareVersion(version, config.version);

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

  if (comparison > 0) {
    console.log('newer!');
    return;
  }
}

function discoverVersion() {
  return '0.0.0';
}
