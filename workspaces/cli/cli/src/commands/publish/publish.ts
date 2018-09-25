import * as path from 'path';
import * as colors from 'wool/colors';
import { catalogue as errors } from 'wool/errors';
import { exec } from 'wool/process';
import { readPackageConfig, resolveWorkspaces } from 'wool/utils';

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
  // get http://localhost:7777/package/lsjroberts/example/1.0.0

  // 4. Pack packages into a bundle
  // wool pack args.dir

  // 5. rsync(?) it up to the registry
}
