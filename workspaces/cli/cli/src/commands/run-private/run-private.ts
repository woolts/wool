import * as path from 'path';
import { spawn } from 'wool/process';
import { localPackagesPath, pathToUrl, readJson } from 'wool/utils';

export default async function runPrivate({ args }) {
  if (!/[A-Za-z0-9-]+$/.test(args.name)) {
    return;
  }

  const config = await readJson(
    `${process.cwd()}/wool-stuff/build-artifacts/private_${
      args.name
    }/wool.json`,
  );

  return spawn('wool', [
    path.join(
      'wool-stuff',
      'build-artifacts',
      `private_${args.name}`,
      config.entry.replace('.ts', '.mjs'),
    ),
    ...process.argv.slice(2),
  ]);
}
