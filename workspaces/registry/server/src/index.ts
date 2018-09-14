import getRegistryConfig from './registry';
import createServer from './server';

async function run() {
  const config: any = await getRegistryConfig();
  await createServer(config.host, config.port);
}

run();
