import path from 'path';
import { exec } from 'wool/process';

import { localPackagesPath, readPackageConfig, woolPath } from '../utils';

export default async function link(dir) {
  const resolvedDir = new URL(`file://${path.resolve(process.cwd(), dir)}/`);
  const woolConfig = await readPackageConfig(resolvedDir);

  const targetPackageDir = path.resolve(
    process.cwd(),
    localPackagesPath,
    woolConfig.name,
  );
  const sourcePackageDir = path.resolve(process.cwd(), dir);
  const relativeSourcePackageDir = path
    .relative(targetPackageDir, sourcePackageDir)
    .replace('../', ''); // Replace one `../` since the symlink is a file

  await exec(`ln -sf ${relativeSourcePackageDir} ${targetPackageDir}`);

  const targetBinDir = path.resolve(process.cwd(), woolPath, '.bin');

  if (woolConfig.bin) {
    await Object.keys(woolConfig.bin).map(async name => {
      const sourceBin = path.resolve(process.cwd(), dir, woolConfig.bin[name]);
      const relativeSourceBin = path.relative(targetBinDir, sourceBin);

      await exec(`ln -sf ${relativeSourceBin} ${targetBinDir}`);
    });
  }

  /*
  const resolvedDir = new URL(`file://${path.resolve(process.cwd(), dir)}/`);
  const woolConfig = await readPackageConfig(resolvedDir);

  const targetPath = path.join(
    localPackagesUrl.href.replace('file://', ''),
    woolConfig.name,
  );
  const absoluteDir = path.resolve(process.cwd(), dir);

  const binDir = `${woolUrl.href.replace('file://', '')}.bin`;
  const targetBin = path.relative(
    `${woolUrl.href.replace('file://')}/.bin`,
    absoluteDir,
  );

  await exec(`mkdir -p ${path.dirname(targetPath)}`);
  await exec(
    `ln -sf ${path.relative(targetPath, absoluteDir)} ${targetPath}/__linked`,
  );

  await Object.keys(woolConfig.bin).map(async name => {
    await exec(
      `ln -sf ${path.join(targetBin, woolConfig.bin[name])} ${binDir}/${name}`,
    );
  });
  */
}
