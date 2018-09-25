import * as path from 'path';
import { spawn } from 'wool/process';
import { localPackagesPath, readInstalledPackageConfig } from 'wool/utils';

export default async function run({ args }) {
  // https://regex101.com/r/zxWhRM/1
  if (
    !/^[A-Za-z0-9-]+\/[A-Za-z0-9-]+\/[0-9]+\.[0-9]+\.[0-9]+$/.test(args.name)
  ) {
    return;
  }

  const [namespace, name, version] = args.name.split('/');
  const config = await readInstalledPackageConfig(
    `${namespace}/${name}`,
    version,
  );

  return spawn('wool', [
    path.join(
      localPackagesPath,
      config.name,
      version,
      config.entry.replace('.ts', '.mjs'),
    ),
    ...process.argv.slice(4),
  ]);
}
