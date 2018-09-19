import * as colors from 'wool/colors';
import { exec } from 'wool/process';
import { resolveWorkspaces } from 'wool/utils';
import * as path from 'path';

export default async function pack({ args, options }) {
  const resolvedDir = path.resolve(process.cwd(), args.dir);
  const bundlesDir = path.relative(
    process.cwd(),
    path.join(resolvedDir, 'wool-stuff', 'bundles'),
  );
  const artifactsDir = path.relative(
    process.cwd(),
    path.join(resolvedDir, 'wool-stuff', 'build-artifacts'),
  );

  await exec(`mkdir -p ${bundlesDir}`);

  const workspaces = await resolveWorkspaces(args.dir);

  for (let name in workspaces) {
    const pkg = workspaces[name];

    const bundleName = `${name.replace('/', '_')}_${pkg.version}.tar.gz`;
    const bundlePath = path.join(bundlesDir, bundleName);

    console.log(
      `Packing ${colors.cyan(name)} into ${colors.magenta(bundlePath)}`,
    );

    await exec(
      `tar -czf ${bundlePath} -C${artifactsDir} ${name}/${pkg.version}/`,
    );
  }

  return Promise.resolve();
}
