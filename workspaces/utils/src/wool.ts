import * as path from 'path';
import { catalogue as errors } from 'wool/errors';

import { readJson, writeFile } from './fs';
import { normaliseUrl, pathToUrl } from './path';

// --- Paths ---
export const woolPath = process.env.WOOL_PATH;
export const localPackagesPath = path.join(woolPath, 'packages');
export const woolUrl = new URL(`file://${process.env.WOOL_PATH}/`);
export const localPackagesUrl = new URL('./packages/', woolUrl);

// --- Configs ---
export interface WoolCommonConfig {
  version?: string;
  registries?: Array<string>;
  dependencies?: {
    direct: {
      [key: string]: string;
    };
    indirect?: {
      [key: string]: string;
    };
  };
}

interface WoolPackageConfig extends WoolCommonConfig {
  entry: string;
  name?: string;
  private?: string;
  bin?: { [key: string]: string };
}

interface WoolWorkspaceConfig extends WoolCommonConfig {
  private: boolean;
  workspaces: Array<string>;
}

// export type WoolConfig = WoolPackageConfig | WoolWorkspaceConfig;
export type WoolConfig = any;

export interface WoolLock {
  [key: string]: ResolvedSpecifier;
}

export interface ResolvedSpecifier {
  name: string;
  version: string;
  constraint: string;
  registry: string;
  size: number;
}

export const readPackageConfig = (url: URL | string): Promise<WoolConfig> =>
  readJson(new URL('wool.json', normaliseUrl(url))).catch(err => {
    // console.error(errors.readPackageConfig(err));
    throw err;
  });

export const writePackageConfig = (
  url: URL | string,
  config: WoolConfig,
): Promise<void> =>
  writeFile(
    new URL('wool.json', normaliseUrl(url)),
    JSON.stringify(config, null, 2),
  );

export const readPackageLock = (url: URL | string): Promise<WoolLock> =>
  readJson(new URL('wool.lock', normaliseUrl(url))).catch(err => {
    // TODO: get stack
    console.error(errors.readPackageLock(err));
    throw err;
  });

export const writePackageLock = (
  url: URL | string,
  config: WoolLock,
): Promise<void> =>
  writeFile(
    new URL('wool.lock', normaliseUrl(url)),
    JSON.stringify(config, null, 2),
  );

export const readPackageVersionLock = async (url: URL): Promise<any> =>
  readJson(new URL('wool.version', url));

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
interface ResolvedWorkspace {
  dir: string;
  version: string;
  private: boolean;
  parentDir: string;
  config: WoolConfig;
}

export async function resolveWorkspaces(
  dir: string,
  version: string = '',
  parentDir: string = '',
): Promise<{ [name: string]: ResolvedWorkspace }> {
  const config = await readPackageConfig(pathToUrl(dir));
  let resolvedWorkspaces = {};

  if (!(<WoolWorkspaceConfig>config).workspaces) {
    if (
      !(<WoolPackageConfig>config).name &&
      !(<WoolPackageConfig>config).private
    ) {
      throw new Error(
        'Can not resolve a package that does not have a name, any ' +
          'workspaces and is not marked as private.',
      );
    }

    return {
      [(<WoolPackageConfig>config).name || `private_${path.basename(dir)}`]: {
        dir,
        version: config.version || version,
        private: config.private || false,
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
