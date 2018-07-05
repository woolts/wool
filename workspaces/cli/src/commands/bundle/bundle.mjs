import { readActivePackageConfig } from '../../utils';

export default async function run({ args, options }) {
  console.log({ args, options });
  const config = await readActivePackageConfig();
  const bundlePath = args.path || `${config.name.replace('/', '_')}.tar.gz`;
  const version = options.version || config.version;

  console.log({ bundlePath, version });

  return Promise.resolve();
}
