import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Paths
export const woolPath = process.env.WOOL_PATH;
export const localPackagesPath = path.join(woolPath, 'packages');
export const woolUrl = new URL(`file://${process.env.WOOL_PATH}/`);
export const localPackagesUrl = new URL('./packages/', woolUrl);

export const pathToUrl = p => new URL(`file://${path.resolve(p)}/`);
export const urlToPath = u => u.href.replace('file://', '');

// Configs
// export type WoolConfig = WoolPackageConfig | WoolWorkspaceConfig;
export type WoolConfig = any;

interface WoolCommonConfig {
  version?: string;
  registries?: Array<string>;
  dependencies?: { [key: string]: string };
}

interface WoolPackageConfig extends WoolCommonConfig {
  name: string;
  entry: string;
  bin?: { [key: string]: string };
}

interface WoolWorkspaceConfig extends WoolCommonConfig {
  private: boolean;
  workspaces: Array<string>;
}

export interface WoolLock {
  [key: string]: {
    version: string;
  };
}

export const readPackageConfig = (url: URL): Promise<WoolConfig> =>
  readFile(new URL('wool.json', url)).then(buffer =>
    JSON.parse(buffer.toString()),
  );

export const writePackageConfig = (
  url: URL,
  config: WoolConfig,
): Promise<void> =>
  writeFile(new URL('wool.json', url), JSON.stringify(config, null, 2));

export const readPackageLock = (url: URL): Promise<WoolLock> =>
  readFile(new URL('wool.lock', url)).then(buffer =>
    JSON.parse(buffer.toString()),
  );

export const writePackageLock = (url: URL, config: WoolLock): Promise<void> =>
  writeFile(new URL('wool.lock', url), JSON.stringify(config, null, 2));

export const readPackageVersionLock = async (url: URL): Promise<any> =>
  readFile(new URL('wool.version', url)).then(buffer =>
    JSON.parse(buffer.toString()),
  );

export const writePackageVersionLock = (url: URL, config: any): Promise<void> =>
  writeFile(new URL('wool.version', url), JSON.stringify(config, null, 2));

export const readActivePackageConfig = (): Promise<WoolConfig> =>
  readPackageConfig(pathToUrl(process.cwd()));

export const writeActivePackageConfig = (config: WoolConfig): Promise<void> =>
  writePackageConfig(pathToUrl(process.cwd()), config);

export const readActivePackageLock = (): Promise<WoolLock> =>
  readPackageLock(pathToUrl(process.cwd()));

export const writeActivePackageLock = (config: WoolLock): Promise<void> =>
  writePackageLock(pathToUrl(process.cwd()), config);

export const readActivePackageVersionLock = (): Promise<any> =>
  readPackageVersionLock(pathToUrl(process.cwd()));

export const writeActivePackageVersionLock = (config: any): Promise<any> =>
  writePackageVersionLock(pathToUrl(process.cwd()), config);

export const readInstalledPackageConfig = (
  name: string,
  version: string,
): Promise<WoolConfig> =>
  readPackageConfig(new URL(`${path.join(name, version)}/`, localPackagesUrl));

// Workspaces
export async function resolveWorkspaces(
  dir: string,
  version: string = '',
  parentDir: string = '',
) {
  const config = await readPackageConfig(pathToUrl(dir));
  let resolvedWorkspaces = {};

  if (!(<WoolWorkspaceConfig>config).workspaces) {
    if (!(<WoolPackageConfig>config).name) {
      throw new Error(
        'Cannot install a package that does not have a name or any workspaces.',
      );
    }

    return {
      [(<WoolPackageConfig>config).name]: {
        dir,
        version: config.version || version,
        parentDir,
        config,
      },
    };
  }

  for (let i = 0; i < (<WoolWorkspaceConfig>config).workspaces.length; i++) {
    const ws = await resolveWorkspaces(
      path.join(dir, (<WoolWorkspaceConfig>config).workspaces[i]),
      config.version || version,
      dir,
    );
    resolvedWorkspaces = {
      ...resolvedWorkspaces,
      ...ws,
    };
  }

  return resolvedWorkspaces;
}
