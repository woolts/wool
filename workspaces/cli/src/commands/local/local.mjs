import path from 'path';
import * as colors from 'wool/cli-colors';
import { exec } from 'wool/process';
import {
  localPackagesPath,
  pathToUrl,
  readActivePackageConfig,
  readPackageConfig,
  resolveWorkspaces,
} from 'wool/utils';

export default async function local({ args, options }) {
  const config = await readActivePackageConfig();

  if (config.private && !config.workspaces) {
    throw new Error(
      'This package can not be published as it is marked as private ' +
        'and does not contain any workspaces.',
    );
  }

  if (!config.workspaces) {
    await installPackage(process.cwd());
  } else {
    const workspaces = await resolveWorkspaces(process.cwd());
    for (let workspace in workspaces) {
      await installPackage(
        workspaces[workspace].dir,
        workspaces[workspace].version,
      );
    }
  }
}

async function installPackage(dir, maybeVersion) {
  const config = await readPackageConfig(pathToUrl(dir));
  const version = config.version || maybeVersion;
  const targetDir = path.join(localPackagesPath, config.name, version);

  if (
    targetDir === '' ||
    targetDir === '/' ||
    !targetDir.startsWith(localPackagesPath)
  ) {
    throw new Error(`Almost deleted everything you twat.`);
  }

  await exec(`rm -rf ${targetDir}`);
  await exec(`mkdir -p ${targetDir}`);
  await exec(`cp -R ${dir}/* ${targetDir}`);

  console.log(
    `Installed ${colors.cyan(config.name)} at ${colors.blue(version)}`,
  );
}
