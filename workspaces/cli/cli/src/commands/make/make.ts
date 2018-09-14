import * as fs from 'fs';
import * as path from 'path';
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
    await makePackage(
      artifactsDir,
      args.dir,
      args.dir,
      config.name,
      config.version,
      {},
    );
  } else {
    const workspaces = await resolveWorkspaces(resolvedDir);
    for (let workspace in workspaces) {
      await makePackage(
        artifactsDir,
        workspaces[workspace].parentDir || args.dir,
        workspaces[workspace].dir,
        workspace,
        workspaces[workspace].version,
        workspaces,
      );
    }
  }

  console.log('');
  console.log(
    `Compiled into ${colors.white(artifactsDir.replace(process.cwd(), '.'))}`,
  );
}

async function makePackage(
  artifactsDir,
  rootDir,
  dir,
  name,
  version,
  workspaces,
) {
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
        artifactsDir,
        rootDir,
        dir,
        name,
        version,
        workspaces,
        await readPackageLock(pathToUrl(dir)).catch(() => ({})),
      ),
      null,
      2,
    ),
  );

  // await exec(`tsc -p ${tsconfigPath} --traceResolution`).catch(result => {
  await exec(`tsc -p ${tsconfigPath}`).catch(result => {
    console.log('--- ERROR ---');
    console.log(result.stdout);
  });
}

function tsconfigTemplate(
  artifactsDir,
  rootDir,
  dir,
  name,
  version,
  workspaces,
  lock,
) {
  const paths = {};
  const references = [];

  Object.keys(lock).forEach(dep => {
    if (workspaces && workspaces[dep]) {
      paths[dep] = [
        // ./lsjroberts/example
        // path.resolve(rootDir, dep, "index.ts"),
        path.relative(
          rootDir,
          path.resolve(
            rootDir,
            workspaces[dep].dir,
            workspaces[dep].config.entry,
          ),
        ),
      ];
      references.push({
        path: path.relative(dir, workspaces[dep].dir),
      });
    } else {
      paths[dep] = [
        // ~/.wool/packages/lsjroberts/example/1.0.0
        path.join(localPackagesPath, dep, `${lock[dep].version}`, 'index.js'),
      ];
    }
  });

  const outDir = path.join(artifactsDir, name, version);

  return {
    compilerOptions: {
      noEmitOnError: true,
      composite: true,
      module: 'esnext',
      moduleResolution: 'node',
      target: 'esnext',
      baseUrl: path.relative(dir, rootDir),
      paths,
      typeRoots: ['/Users/laurenceroberts/.wool/types'],
      outDir,
      // outDir: path.relative(
      //   dir,
      //   path.resolve(
      //     process.cwd(),
      //     // rootDir,
      //     "wool-stuff/build-artifacts",
      //     name,
      //     version
      //   )
      // )
    },
    references,
    include: ['./**/*'],
    // files: ['./index.ts'],
  };
}