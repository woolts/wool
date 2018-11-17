import * as path from 'path';
import { spawn } from 'wool/process';
import { readPackageConfig } from 'wool/utils';

export default async function runPrivate({ args }) {
  if (!/[A-Za-z0-9-]+$/.test(args.name)) {
    return;
  }

  const dir = path.join(
    process.cwd(),
    'wool-stuff',
    'build-artifacts',
    args.name,
  );

  const config = await readPackageConfig(dir);

  return spawn('wool', [
    path.join(dir, config.entry.replace('.ts', '.mjs')),
    ...process.argv.slice(2),
  ]);
}
