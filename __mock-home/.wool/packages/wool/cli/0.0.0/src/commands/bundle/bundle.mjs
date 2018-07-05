import { readActivePackageConfig } from '../../utils';

export default async function run({ args, options }) {
  console.log({ args, options });
  const config = await readActivePackageConfig();
  const bundlePath = args.path || `${config.name.replace('/', '_')}.tar.gz`;

  console.log({ bundlePath });

  return Promise.resolve();
}
