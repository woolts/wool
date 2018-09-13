import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import * as colors from 'wool/cli-colors';
import { exec } from 'wool/process';
import {
  localPackagesPath,
  pathToUrl,
  readPackageConfig,
  readPackageLock,
  resolveWorkspaces,
} from 'wool/utils';

const writeFile = promisify(fs.writeFile);

export default async function make({ args, options }) {
  const resolvedDir = path.resolve(process.cwd(), args.dir);
  const artifactsDir = path.join(resolvedDir, '/wool-stuff/build-artifacts');
  const config = await readPackageConfig(pathToUrl(resolvedDir));

  await exec(`rm -rf ${artifactsDir}`);

  if (!config.workspaces) {
    await makePackage(args.dir, args.dir, config.name, config.version);
  } else {
    const workspaces = await resolveWorkspaces(resolvedDir);
    for (let workspace in workspaces) {
      await makePackage(
        args.dir,
        workspaces[workspace].dir,
        workspace,
        workspaces[workspace].version,
      );
    }
  }

  console.log('');
  console.log(
    `Compiled into ${colors.white(artifactsDir.replace(process.cwd(), '.'))}`,
  );
}

async function makePackage(rootDir, dir, name, version) {
  console.log(
    `Compiling ${colors.cyan(name)} from ${colors.white(
      dir.replace(process.cwd(), '.'),
    )}`,
  );

  const tsconfigPath = path.join(dir, 'tsconfig.json');

  await exec(`mkdir -p ${path.dirname(tsconfigPath)}`);
  await writeFile(
    tsconfigPath,
    JSON.stringify(
      tsconfigTemplate(
        rootDir,
        dir,
        name,
        version,
        await readPackageLock(pathToUrl(dir)),
      ),
      null,
      2,
    ),
  );

  await exec(`tsc -p ${tsconfigPath} --traceResolution`).catch(result => {
    console.log('--- ERROR ---');
    console.log(result.stdout);
  });
}

function tsconfigTemplate(rootDir, dir, name, version, lock) {
  const paths = {};
  const references = [];

  Object.keys(lock).forEach(dep => {
    paths[dep] = [
      // ./lsjroberts/example
      path.resolve(rootDir, dep, 'index.ts'),

      // ~/.wool/packages/lsjroberts/example/1.0.0
      path.join(localPackagesPath, dep, `${lock[dep].version}`, 'index.js'),
    ];

    references.push({ path: `../../${dep}` });
  });

  return {
    compilerOptions: {
      composite: true,
      module: 'esnext',
      baseUrl: rootDir,
      paths,
      outDir: path.relative(
        dir,
        path.resolve(
          process.cwd(),
          rootDir,
          'wool-stuff/build-artifacts',
          name,
          version,
        ),
      ),
    },
    references,
    include: ['./*'],
    // files: ['./index.ts'],
  };
}
