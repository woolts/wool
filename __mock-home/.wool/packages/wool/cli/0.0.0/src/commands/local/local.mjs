import path from 'path';
import { exec } from 'wool/process';

import { localPackagesPath, readActivePackageConfig } from '../../utils';

export default async function local({ args, options }) {
  const config = await readActivePackageConfig();
  const dir = process.cwd();
  const targetDir = path.join(localPackagesPath, config.name, config.version);

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
}
