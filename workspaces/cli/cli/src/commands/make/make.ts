import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as colors from 'wool/colors';
import * as errors from 'wool/errors';
import { exec } from 'wool/process';
import {
  localPackagesPath,
  pathToUrl,
  readInstalledPackageConfig,
  readPackageConfig,
  readPackageLock,
  resolveWorkspaces,
  writePackageConfig,
} from 'wool/utils';

const writeFile = promisify(fs.writeFile);

// export default async function make({ args }) {
//   const resolvedDir = path.resolve(process.cwd(), args.dir);
//   const artifactsDir = path.join(resolvedDir, '/wool-stuff/build-artifacts');

//   await prepare(resolvedDir);
// }

export default async function make({ args, options }) {
  // TODO: Before compiling, we should inspect the workspaces and dependencies.
  // If we can detect any future problems, such as missing dependencies or
  // lock files, we should error early before compilation. Split into
  // three stages: preparation, validation and compiliation.

  // TODO: Always make into cwd/wool-stuff/build-artifacts, not relative to
  // entry dir. This prevents duplicating artifacts in sub-directories and
  // will help incremental builds.

  // TODO: Incrementally build, if possible through typescript then by file,
  // else by package.

  // TODO: Add a --watch flag.

  const resolvedDir = path.resolve(process.cwd(), args.dir);
  const artifactsDir = path.join(resolvedDir, 'wool-stuff', 'build-artifacts');

  let continueMake = true;
  const workspaces = await (options.force
    ? resolveWorkspaces(resolvedDir)
    : prepare(resolvedDir, artifactsDir)
  ).catch(err => {
    console.log('');
    console.log(err.message);
    continueMake = false;
    return [];
  });

  if (!continueMake) return;

  await compile(workspaces, artifactsDir, args);

  if (Object.keys(workspaces).length === 0) {
    console.log(`No changes made since last compilation 👍`);
  } else {
    console.log('');
    console.log(
      `Compiled into ${colors.white(artifactsDir.replace(process.cwd(), '.'))}`,
    );
  }
}

async function prepare(resolvedDir, artifactsDir) {
  const workspaces = await resolveWorkspaces(resolvedDir).catch(
    handleWorkspaceError(resolvedDir),
  );
  const dirtyWorkspaces = {};

  for (let name in workspaces) {
    const pkg = workspaces[name];
    const [lastModifiedTime, lastModifiedFile] = (await exec(
      `find ${
        pkg.dir
      } -type f -print0 | xargs -0 stat -f "%m %N" | sort -rn | head -1`,
    )).split(' ');

    const { compiledAt } = await readPackageConfig(
      pathToUrl(path.join(artifactsDir, name, pkg.version)),
    ).catch(() => ({ compiledAt: 9999999999 }));

    if (
      compiledAt === undefined ||
      Number(lastModifiedTime) >= Math.floor(Number(compiledAt) / 1000)
    ) {
      dirtyWorkspaces[name] = pkg;
    }
  }

  return dirtyWorkspaces;
}

async function validate(pkg) {
  // Check existance of wool.lock
}

async function compile(workspaces, artifactsDir, args) {
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

  const packageArtifactDir = path.join(artifactsDir, name, version);
  if (
    packageArtifactDir !== '' &&
    packageArtifactDir !== '/' &&
    packageArtifactDir !== '~'
  ) {
    await exec(`rm -rf ${packageArtifactDir}`);
  }

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
    .catch(handleTypescriptCompileError)
    .then(async () => {
      const relativeArtifactsDir = path.relative(process.cwd(), artifactsDir);

      // TODO: This is duplicating .js files to .mjs, in an ideal world we would
      // only store .mjs files. However typescript does not recognise these
      // from the `paths` option, and node esm loaders use .mjs files.
      await exec(
        `find ${relativeArtifactsDir} -name "*.js" -type f -exec ` +
          `bash -c 'cp "$1" "\${1%.js}".mjs' - '{}' \\;`,
      );

      await exec(
        `cp ${path.join(dir, 'wool.json')} ${path.join(
          artifactsDir,
          name,
          version,
          'wool.json',
        )}`,
      );

      const artifactUrl = pathToUrl(path.join(artifactsDir, name, version));
      const artifactConfig = await readPackageConfig(artifactUrl);
      await writePackageConfig(artifactUrl, {
        ...artifactConfig,
        compiledAt: Date.now(),
      });

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
      console.log('');
      console.log(error.message);
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

function handleWorkspaceError(resolvedDir) {
  return err => {
    const missingWoolMatch = err.message.match(
      /ENOENT: no such file or directory, open '(.+)wool\.json'/,
    );

    if (!missingWoolMatch) throw err;

    const dir = missingWoolMatch[1].replace(`${resolvedDir}/`, '');
    const predictedName = dir.split('/')[dir.split('/').length - 2];

    throw new Error(errors.makeMissingWoolConfig({ dir, predictedName }));
  };
}

async function handleTypescriptCompileError(err) {
  const compileErrors = err.stdout.split('\n');

  const formattedErrors = await Promise.all(
    compileErrors.map(async compileError => {
      // https://regex101.com/r/tWRRQ3/1
      const cannotFindModuleMatch = compileError.match(
        /([^(]+)\(([0-9]+),([0-9]+)\): error TS2307: Cannot find module '(.+)'\./,
      );
      const genericMatch = compileError.match(
        /([^(]+)\(([0-9]+),([0-9]+)\): error (.+): (.+)/,
      );

      if (cannotFindModuleMatch) {
        const [, filePath, line, pos, name] = cannotFindModuleMatch;
        return await errors.makeTypescriptMissingModuleError({
          filePath,
          line,
          pos,
          name,
        });
      }

      if (genericMatch) {
        const [, filePath, line, pos, code, message] = genericMatch;
        return await errors.makeTypescriptGenericError({
          filePath,
          line,
          pos,
          message,
        });
      }

      return err.message;
    }),
  );

  formattedErrors.push(
    `There were ${formattedErrors.length - 1} compilation errors.`,
  );

  throw new Error(formattedErrors.join('\n\n\n'));
}
