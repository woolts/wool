// import { normaliseUrl, readJson } from 'wool/fs';
import { normaliseUrl, readJson } from 'wool/utils';

export const CONFIG_FILENAME = 'wool.json';
export const LOCK_FILENAME = 'wool.lock';

export interface WoolConfig {
  bin?: { [key: string]: string };
  dependencies?: {
    direct: { [key: string]: string };
    indirect: { [key: string]: string };
  };
  entry?: string;
  name?: string;
  private?: true;
  tasks?: { [key: string]: Array<string> | { [key: string]: Array<string> } };
  version?: string;
  workspaces?: Array<string>;
}

export interface WoolLock {
  [key: string]: {
    constraint: string;
    registry: string;
    size: number;
    version: string;
  };
}

export const readPackageConfig = (url: URL | string): Promise<WoolConfig> => {
  const resolvedUrl = createUrl(CONFIG_FILENAME, url);
  return readJson(resolvedUrl).then(config => {
    if (!config.workspaces && !config.name && !config.private) {
      throw new Error(
        // TODO: errors.readPackageConfigUnknown()
        `I am unable to resolve a package that does not have a name or any workspaces, and is not marked as private.\n    ${resolvedUrl}`,
      );
    }

    if (!config.dependencies) {
      config.dependencies = { direct: {}, indirect: {} };
    }
    if (!config.dependencies.direct) {
      config.dependencies.direct = {};
    }
    if (!config.dependencies.indirect) {
      config.dependencies.indirect = {};
    }

    return config;
  });
};

export const readPackageLock = (url: URL | string): Promise<WoolLock> => {
  const resolvedUrl = createUrl(LOCK_FILENAME, url);
  return readJson(resolvedUrl).catch(
    () =>
      new Error(
        `I am unable to resolve the package wool.lock.\n     ${resolvedUrl}`,
      ),
  );
};

const createUrl = (path: string, url: URL | string) =>
  new URL(path, normaliseUrl(url));
