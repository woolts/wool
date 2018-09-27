import * as path from 'path';
import * as cliQuestions from 'wool/cli-questions';
import { spawn } from 'wool/process';
import { writeFile, writePackageConfig, writePackageLock } from 'wool/utils';

export default async function init({ args }) {
  const resolvedDir = path.resolve(process.cwd(), args.dir || '.');

  const { name }: any = await cliQuestions.ask([
    {
      type: 'input',
      name: 'name',
      message: 'Name (e.g. you/package)',
    },
  ]);

  await spawn('mkdir', ['-p', args.dir]);

  await writePackageConfig(resolvedDir, {
    name,
    entry: 'index.ts',
    version: '0.0.0',
    registries: [],
    dependencies: {},
  });

  await writePackageLock(resolvedDir, {});

  await writeFile(
    path.join(resolvedDir, 'index.ts'),
    "export default () => 'Hello';",
  );
}
