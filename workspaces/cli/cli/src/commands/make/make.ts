import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as colors from 'wool/colors';
import { exec } from 'wool/process';
import {
  localPackagesPath,
  pathToUrl,
  readInstalledPackageConfig,
  readPackageConfig,
  readPackageLock,
  resolveWorkspaces,
} from 'wool/utils';

const writeFile = promisify(fs.writeFile);

export default async function make({ args, options }) {
  // TODO: Before compiling, we should inspect the workspaces and dependencies.
  // If we can detect any future problems, such as missing dependencies or
  // lock files, we should error early before compilation. Split into
  // three stages: preparation, validation and compiliation.

  // TODO: Skip packages that do not need to be built (based on touch time
  // compared to last build time).

  // TODO: Always make into cwd/wool-stuff/build-artifacts, not relative to
  // entry dir. This prevents duplicating artifacts in sub-directories and
  // will help incremental builds.

  // TODO: Incrementally build, if possible through typescript then by file,
  // else by package.

  // TODO: Add a --watch flag.

  const resolvedDir = path.resolve(process.cwd(), args.dir);
  const artifactsDir = path.join(resolvedDir, '/wool-stuff/build-artifacts');
  const config = await readPackageConfig(pathToUrl(resolvedDir));

  await exec(`rm -rf ${artifactsDir}`);

  // TOOD: remove this as it should not be needed since resolveWorkspaces
  // handles the single package situation
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

// TODO: reduce the number of arguments this function takes
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
      await tsconfigTemplate(
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
  await exec(`tsc -p ${tsconfigPath}`)
    .then(async () => {
      const relativeArtifactsDir = path.relative(process.cwd(), artifactsDir);

      // TODO: This is duplicating .js files to .mjs, in an ideal world we would
      // only store .mjs files. However typescript does not recognise these
      // from the `paths` option, and node esm loaders use .mjs files.
      await exec(
        `find ${relativeArtifactsDir} -name "*.js" -type f -exec bash -c 'cp "$1" "\${1%.js}".mjs' - '{}' \\;`,
      );

      await exec(
        `cp ${path.join(dir, 'wool.json')} ${path.join(
          artifactsDir,
          name,
          version,
          'wool.json',
        )}`,
      );

      // TODO: If there is no lock file we should install the latest and inform
      // the user of the upgrade plan.
      await exec(
        `cp ${path.join(dir, 'wool.lock')} ${path.join(
          artifactsDir,
          name,
          version,
          'wool.lock',
        )}`,
      );

      // TODO: We want to clean out the package if we re-build it, however this
      // will break other packages that import the compiled package.
      // await exec(`rm -rf ${path.join(localPackagesPath, name, version)}`);

      await exec(`mkdir -p ${path.join(localPackagesPath, name, version)}`);
      await exec(
        `cp -R ${path.join(artifactsDir, name, version)} ${path.join(
          localPackagesPath,
          name,
        )}`,

        // TODO: symlink binaries
      );
    })
    .catch(error => {
      console.log(colors.red('--- ERROR ---'));
      if (error.stdout) {
        console.log(error.stdout);
      } else {
        console.log(error.stack);
      }
    });
}

async function tsconfigTemplate(
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

  await Promise.all(
    Object.keys(lock).map(async dep => {
      if (workspaces && workspaces[dep]) {
        paths[dep] = [
          // ./lsjroberts/example
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
        const installedConfig = await readInstalledPackageConfig(
          dep,
          lock[dep].version,
        );
        paths[dep] = [
          // ~/.wool/packages/lsjroberts/example/1.0.0
          path.relative(
            rootDir,
            path.join(
              localPackagesPath,
              dep,
              `${lock[dep].version}`,
              installedConfig.entry.replace('.ts', '.js'),
            ),
          ),
        ];
      }
    }),
  );

  const outDir = path.relative(dir, path.join(artifactsDir, name, version));

  return {
    compilerOptions: {
      noEmitOnError: true,
      composite: true,
      module: 'esnext',
      moduleResolution: 'node',
      target: 'esnext',
      baseUrl: path.relative(dir, rootDir),
      paths,
      typeRoots: ['/Users/laurenceroberts/.wool/types'], // TODO: localTypesPath
      outDir,
    },
    references,
    include: ['./**/*'],
  };
}
