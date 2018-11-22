// import { errors } from 'wool/messages';
import * as path from 'path';

import {
  readPackageConfig,
  readPackageLock,
  WoolConfig,
  WoolLock,
} from './config';

export interface ResolvedWorkspace {
  config: WoolConfig;
  dir: string;
  lock: WoolLock;
  version: string;
}

// export const foo = compose(
//   async dir => [dir, await readPackageConfig(dir)],
//   ([dir, config]) => resolveWorkspacesHelper(dir, config),
// );

export const resolveWorkspaces = (
  dir: string,
): Promise<{ [key: string]: ResolvedWorkspace }> =>
  readPackageConfig(dir)
    .then(config => resolveWorkspacesHelper(dir, config))
    .catch(err => {
      // console.log(errors.resolveWorkspaces(dir, err));
      throw new Error(err);
    });

const resolveWorkspacesHelper = async (
  dir: string,
  config: WoolConfig,
): Promise<{ [key: string]: ResolvedWorkspace }> => {
  let resolved = {};

  if (!config.workspaces) {
    const lock = await readPackageLock(dir);
    const version = config.version || '0.0.0'; // parentVersion;
    return {
      [config.name]: {
        config,
        dir,
        lock,
        version,
      },
    };
  }

  for (let i = 0; i < config.workspaces.length; i++) {
    resolved = {
      ...resolved,
      ...(await resolveWorkspaces(path.join(dir, config.workspaces[i]))),
    };
  }

  return resolved;
};