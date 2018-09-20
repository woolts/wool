import * as path from 'path';
import * as colors from 'wool/colors';
import * as errors from 'wool/errors';
import { exec } from 'wool/process';
import { readActivePackageConfig, resolveWorkspaces } from 'wool/utils';

export default async function publish({ args, options }) {
  const resolvedDir = path.resolve(process.cwd(), args.dir);
  const bundlesDir = path.relative(
    process.cwd(),
    path.join(resolvedDir, 'wool-stuff', 'bundles'),
  );
  const workspaces = await resolveWorkspaces(args.dir);

  // 1. Get registry from config
  const config = await readActivePackageConfig();
  if (!config.registries) {
    console.log('');
    console.error(errors.publishMissingRegistries());
    return;
  }

  // 2. Test network access to registry
  // 3. Check if version is already published
  // 4. Pack packages into a bundle
  // 5. rsync(?) it up to the registry
}
