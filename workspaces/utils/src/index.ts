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
export interface WoolConfig {
  name: string;
  version: string;
  workspaces: Array<string>;
}

export const readPackageConfig = url =>
  readFile(new URL('wool.json', url)).then(
    buffer => buffer.toJSON().data as any, // TODO: as WoolConfig
  );

export const writePackageConfig = (url, config) =>
  writeFile(new URL('wool.json', url), JSON.stringify(config, null, 2));

export const readPackageLock = url =>
  readFile(new URL('wool.lock', url)).then(
    buffer => buffer.toJSON().data as any,
  );

export const writePackageLock = (url, config) =>
  writeFile(new URL('wool.lock', url), JSON.stringify(config, null, 2));

export const readPackageVersionLock = async url =>
  readFile(new URL('wool.version', url)).then(
    buffer => buffer.toJSON().data as any,
  );

export const writePackageVersionLock = (url, config) =>
  writeFile(new URL('wool.version', url), JSON.stringify(config, null, 2));

export const readActivePackageConfig = () =>
  readPackageConfig(pathToUrl(process.cwd()));

export const writeActivePackageConfig = config =>
  writePackageConfig(pathToUrl(process.cwd()), config);

export const readActivePackageLock = () =>
  readPackageLock(pathToUrl(process.cwd()));

export const writeActivePackageLock = config =>
  writePackageLock(pathToUrl(process.cwd()), config);

export const readActivePackageVersionLock = () =>
  readPackageVersionLock(pathToUrl(process.cwd()));

export const writeActivePackageVersionLock = config =>
  writePackageVersionLock(pathToUrl(process.cwd()), config);

// Workspaces
export async function resolveWorkspaces(dir, version = '', parentDir = '') {
  const config = await readPackageConfig(pathToUrl(dir));
  let resolvedWorkspaces = {};

  if (!config.workspaces) {
    if (!config.name) {
      throw new Error(
        'Cannot install a package that does not have a name or any workspaces.',
      );
    }

    return {
      [config.name]: {
        dir,
        version: config.version || version,
        parentDir,
        config,
      },
    };
  }

  for (let i = 0; i < config.workspaces.length; i++) {
    const ws = await resolveWorkspaces(
      path.join(dir, config.workspaces[i]),
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
