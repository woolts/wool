import * as path from 'path';
import {
  pathToUrl,
  readPackageConfig,
  writePackageConfig,
  woolUrl,
} from 'wool/utils';

export default async function init() {
  const globalConfig = await readPackageConfig(woolUrl);
  await writePackageConfig(pathToUrl(process.cwd()), {
    name: `${globalConfig.config.namespace}/${path.basename(process.cwd())}`,
    version: '0.0.0',
    entry: 'index.ts',
    registries: [],
    dependencies: {},
  });
}
