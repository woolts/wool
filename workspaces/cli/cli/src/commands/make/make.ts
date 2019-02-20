import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as colors from 'wool/colors';
import { errors } from 'wool/messages';
import { exec } from 'wool/process';
import {
  dirSize,
  localPackagesPath,
  get,
  getWorkspaceDependencyTree,
  map,
  pathToUrl,
  readInstalledPackageConfig,
  readPackageConfig,
  readPackageLock,
  resolveWorkspaces,
  writePackageConfig,
  zipObject,
} from 'wool/utils';

import { startSpinner, stopSpinner } from '../spinners';

const writeFile = promisify(fs.writeFile);

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

  // TODO: Copy bins and symlink to ~/.wool/.bin

  const resolvedDir = path.resolve(process.cwd(), args.dir);
  const artifactsDir = path.join(resolvedDir, 'wool-stuff', 'build-artifacts');

  let continueMake = true;

  const workspaces =
    (await resolveWorkspaces(resolvedDir).catch(
      handleWorkspaceError(resolvedDir),
    )) || {};

  const dependencyTree = await getWorkspaceDependencyTree(workspaces);

  if (dependencyTree.looped.length > 0) {
    console.log(
      'There is an unresolvable loop in your dependency tree, I am unable to proceed.',
    );
    dependencyTree.looped.forEach(loop => {
      console.log(`    ${loop.config.name}`);
    });
    return;
  }

  if (!continueMake) return;

  const dirtyWorkspaces = await (options.force
    ? zipObject(
        map(get('config.name'), dependencyTree.tree),
        dependencyTree.tree,
      )
    : prepare(dependencyTree.tree, artifactsDir));

  if (Object.keys(dirtyWorkspaces).length === 0) {
    console.log(`No changes made since last compilation 👍`);
    return;
  }

  await compile(dirtyWorkspaces, artifactsDir, args);
}

async function prepare(workspaces, artifactsDir) {
  const dirtyWorkspaces = {};

  for (let workspace of workspaces) {
    const [lastModifiedTime, lastModifiedFile] = (await exec(
      `find ${
        workspace.dir
      } -type f -print0 | xargs -0 stat -f "%m %N" | sort -rn | head -1`,
    ))
      .toString()
      .split(' ');

    const { compiledAt } = await readPackageConfig(
      pathToUrl(
        path.join(
          artifactsDir,
          workspace.config.name,
          workspace.config.private ? '' : workspace.version,
        ),
      ),
    ).catch(() => ({ compiledAt: 9999999999 }));

    if (
      compiledAt === undefined ||
      Number(lastModifiedTime) >= Math.floor(Number(compiledAt) / 1000)
    ) {
      dirtyWorkspaces[workspace.config.name] = workspace;
    }
  }

  return dirtyWorkspaces;
}

async function validate(pkg) {
  // Check existance of wool.lock
}

async function compile(workspaces, artifactsDir, args) {
  for (let name in workspaces) {
    const success = await makePackage(
      artifactsDir,
      workspaces,
      name,
      workspaces[name],
      args,
    );
    if (!success) break;
  }
}

async function makePackage(artifactsDir, workspaces, name, pkg, args) {
  const dir = pkg.dir;
  const version = pkg.version;

  const relativeArtifactsDir = path.relative(process.cwd(), artifactsDir);

  const packageArtifactDir = path.join(
    artifactsDir,
    name,
    !pkg.name && pkg.private ? '' : version,
  );
  const packageArtifactUrl = pathToUrl(packageArtifactDir);

  startSpinner(
    () =>
      `Compiling ${colors.cyan(name)} from ${colors.white(
        dir.replace(`${process.cwd()}/`, ''),
      )} into ${colors.magenta(
        packageArtifactDir.replace(`${process.cwd()}/`, ''),
      )}`,
  );

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
        packageArtifactDir,
        workspaces,
        pkg,
        args,
        await readPackageLock(pathToUrl(dir)).catch(() => ({})),
      ),
      null,
      2,
    ),
  );

  // await exec(`tsc -p ${tsconfigPath} --traceResolution`).catch(result => {
  return exec(`tsc -p ${tsconfigPath}`)
    .catch(handleTypescriptCompileError)
    .then(async () => {
      // TODO: This is duplicating .js files to .mjs, in an ideal world we would
      // only store .mjs files. However typescript does not recognise these
      // from the `paths` option, and node esm loaders use .mjs files.
      await exec(
        `find ${relativeArtifactsDir} -name "*.js" -type f -exec ` +
          `bash -c 'cp "$1" "\${1%.js}".mjs' - '{}' \\;`,
      );

      await exec(
        `cp ${path.join(dir, 'wool.json')} ${path.join(
          packageArtifactDir,
          'wool.json',
        )}`,
      );

      const compiledSize = await dirSize(dir);

      const artifactConfig = await readPackageConfig(packageArtifactUrl);
      await writePackageConfig(packageArtifactUrl, {
        ...artifactConfig,
        compiledAt: Date.now(),
        compiledSize,
      });

      // TODO: If there is no lock file we should install the latest and inform
      // the user of the upgrade plan.
      await exec(
        `cp ${path.join(dir, 'wool.lock')} ${path.join(
          packageArtifactDir,
          'wool.lock',
        )}`,
      );

      // TODO: We want to clean out the package if we re-build it, however this
      // will break other packages that import the compiled package.
      // await exec(`rm -rf ${path.join(localPackagesPath, name, version)}`);

      if (!pkg.name && pkg.private) {
        return;
      }

      await exec(`mkdir -p ${path.join(localPackagesPath, name, version)}`);
      await exec(
        `cp -R ${path.join(artifactsDir, name, version)} ${path.join(
          localPackagesPath,
          name,
        )}`,
      );
      // TODO: symlink binaries
    })
    .then(() => {
      stopSpinner(
        () =>
          `🐑 Compiled ${colors.cyan(name)} from ${colors.white(
            dir.replace(`${process.cwd()}/`, ''),
          )} into ${colors.magenta(
            packageArtifactDir.replace(`${process.cwd()}/`, ''),
          )}`,
      );

      return true;
    })
    .catch(error => {
      stopSpinner(
        () =>
          `❌ ${colors.red('Failed to compile')} ${colors.cyan(
            name,
          )} ${colors.red('from')} ${colors.white(
            dir.replace(`${process.cwd()}/`, ''),
          )} ${colors.red('into')} ${colors.magenta(
            packageArtifactDir.replace(`${process.cwd()}/`, ''),
          )}`,
      );

      console.log('');
      console.log(error.message ? error.message : error);

      return false;
    });
}

async function tsconfigTemplate(
  packageArtifactDir,
  workspaces,
  pkg,
  args,
  lock,
) {
  const rootDir = pkg.parentDir || args.dir;
  const dir = pkg.dir;

  const paths = {};
  const references = [];

  await Promise.all(
    Object.keys(lock).map(async dep => {
      // TODO: it should only shortcut to local workspace if the constraint
      // matches the local version
      // if (workspaces && workspaces[dep]) {
      //   paths[dep] = [
      //     // ./lsjroberts/example
      //     path.relative(
      //       rootDir,
      //       path.resolve(
      //         rootDir,
      //         workspaces[dep].dir,
      //         workspaces[dep].config.entry,
      //       ),
      //     ),
      //   ];
      //   references.push({
      //     path: path.relative(dir, workspaces[dep].dir),
      //   });
      // } else {
      const installedConfig = await readInstalledPackageConfig(
        dep,
        lock[dep].version,
      );
      paths[dep] = [
        // ~/.wool/packages/lsjroberts/example/1.0.0
        // path.relative(
        // rootDir,
        path.join(
          localPackagesPath,
          dep,
          `${lock[dep].version}`,
          installedConfig.entry.replace('.ts', '.js'),
        ),
        // ),
      ];
      // }
    }),
  );

  // const outDir = path.relative(dir, packageArtifactDir);
  const outDir = packageArtifactDir;

  return {
    compilerOptions: {
      noEmitOnError: true,
      composite: true,
      module: 'esnext',
      moduleResolution: 'node',
      // lib: ['esnext'], // TODO: why did I add this? it breaks on `URL` not found
      target: 'esnext',
      baseUrl: path.relative(dir, rootDir),
      // baseUrl: '.',
      paths,
      typeRoots: [localPackagesPath.replace('packages', 'types')], // TODO: localTypesPath
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

  const formattedErrors = (await Promise.all(
    compileErrors.map(async compileError => {
      // https://regex101.com/r/tWRRQ3/1
      const cannotFindModuleMatch = compileError.match(
        /([^(]+)\(([0-9]+),([0-9]+)\): error TS2307: Cannot find module '(.+)'\./,
      );
      const genericMatch = compileError.match(
        /([^(]+)\(([0-9]+),([0-9]+)\): error ([^:]+): ((.|\n)+)/,
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

      return compileError;
    }),
  )).filter(Boolean);

  formattedErrors.push(
    `There ${formattedErrors.length === 1 ? 'was' : 'were'} ${
      formattedErrors.length
    } compilation error${formattedErrors.length === 1 ? '' : 's'}.`,
  );

  throw new Error(formattedErrors.join('\n\n\n'));
}
