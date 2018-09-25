import * as path from 'path';
import * as colors from 'wool/colors';
import { catalogue as errors } from 'wool/errors';
import { exec, spawn } from 'wool/process';
import { readPackageConfig, resolveWorkspaces, woolPath } from 'wool/utils';

import make from '../make/make';
import pack from '../pack/pack';

export default async function publish({ args, options }) {
  const resolvedDir = path.resolve(process.cwd(), args.dir);
  const bundlesDir = path.relative(
    process.cwd(),
    path.join(resolvedDir, 'wool-stuff', 'bundles'),
  );
  const workspaces = await resolveWorkspaces(resolvedDir);

  // 1. Get registry from config
  const config = await readPackageConfig(resolvedDir);

  if (!config.registries) {
    console.log('');
    console.error(errors.publishMissingRegistries());
    return;
  }

  // 2. Test network access to registry
  // TODO: how do we handle multiple registries? Is there a config.publishRegistry?
  try {
    await exec(`curl ${config.registries[0]}`);
  } catch (err) {
    console.error(
      errors.publishRegistryConnectionRefused(config.registries[0]),
    );
    return;
  }

  // 3. Check if version is already published
  const published = {};
  const unpublished = {};
  await Promise.all(
    Object.keys(workspaces).map(async name => {
      const pkg = workspaces[name];
      await exec(
        `curl ${config.registries[0]}/packages/${name}/${pkg.version}`,
      ).then(res => {
        // TODO: have a better way to checking the status
        if (res === '404') {
          unpublished[name] = pkg;
        } else {
          published[name] = pkg;
        }
      });
    }),
  );

  if (Object.keys(published).length > 0) {
    Object.keys(published).forEach(name => {
      const pkg = published[name];
      // TODO: better error message
      console.error(`${name} has already been published at ${pkg.version}`);
    });
  }

  // 4. Compile packages to ensure they are valid
  console.log('');
  await make({ args: { dir: args.dir }, options: { force: false } });

  // 5. Pack packages into a bundle
  console.log('');
  await pack({ args: { dir: args.dir }, options: {} });

  // 6. rsync it up to the registry
  console.log('');

  const pendings = [];
  const completes = [];
  // https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frame = 0;
  let first = true;

  // https://stackoverflow.com/a/34848607
  const spinnersInterval = setInterval(() => {
    if (!first) {
      process.stdout.write(`\u001B[${Object.keys(unpublished).length}A`);
    }
    first = false;
    pendings.forEach((pending, i) => {
      const name = Object.keys(unpublished)[i];
      if (completes.includes(name)) {
        process.stdout.write(
          `🛳  Published ${colors.cyan(name)} to ${colors.magenta(
            config.registries[0],
          )}\n`,
        );
      } else {
        process.stdout.write(
          `${colors.magenta(frames[frame])} Publishing ${colors.cyan(
            name,
          )} to ${colors.magenta(config.registries[0])}\n`,
        );
      }
    });
    frame++;
    frame = frame % frames.length;
  }, 80);

  Object.keys(unpublished).forEach(name => {
    const pkg = unpublished[name];

    // TODO: don't duplicate this from pack
    const bundlesDir = path.relative(
      process.cwd(),
      path.join(resolvedDir, 'wool-stuff', 'bundles'),
    );
    const bundleName = `${name.replace('/', '_')}_${pkg.version}.tar.gz`;
    const bundlePath = path.join(bundlesDir, bundleName);

    pendings.push(
      spawn('rsync', [
        bundlePath.replace(process.cwd(), '.'),
        path.join(woolPath, 'registries/example/packages/'),
      ])
        .then(
          () =>
            new Promise(resolve =>
              setTimeout(resolve, Math.random() * 1000 + 1000),
            ),
        )
        .then(() => {
          completes.push(name);
        }),
    );
  });

  await Promise.all(pendings)
    .then(() => new Promise(resolve => setTimeout(resolve, 80)))
    .then(() => {
      clearInterval(spinnersInterval);
    });
}
