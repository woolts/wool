// import { errors } from 'wool/messages';
import { Dict, List } from 'wool/core';
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

export type WorkspaceTree = Dict.Dict<
  string,
  {
    children: WorkspaceTree;
  } & ResolvedWorkspace
>;

// export const foo = compose(
//   async dir => [dir, await readPackageConfig(dir)],
//   ([dir, config]) => resolveWorkspacesHelper(dir, config),
// );

export const resolveWorkspaces = (
  dir: string,
  parentVersion?: string,
): Promise<Dict.Dict<string, ResolvedWorkspace>> =>
  readPackageConfig(dir)
    .then(config => resolveWorkspacesHelper(dir, config, parentVersion))
    .catch(err => {
      // console.log(errors.resolveWorkspaces(dir, err));
      throw new Error(err);
    });

const resolveWorkspacesHelper = async (
  dir: string,
  config: WoolConfig,
  parentVersion?: string,
): Promise<Dict.Dict<string, ResolvedWorkspace>> => {
  let resolved = Dict.empty();

  if (!config.workspaces) {
    const lock = await readPackageLock(dir);
    const version = config.version || parentVersion;
    return Dict.singleton(config.name, {
      config,
      dir,
      lock,
      version,
    });
  }

  for (let i = 0; i < config.workspaces.length; i++) {
    resolved = Dict.fromList(
      List.cons(
        Dict.toList(resolved),
        Dict.toList(
          await resolveWorkspaces(
            path.join(dir, config.workspaces[i]),
            config.version || parentVersion,
          ),
        ),
      ),
    );
    // resolved = Dict.insert(?, ?, resolved);
    // resolved = {
    //   ...resolved,
    //   ...(),
    // };
  }

  return resolved;
};

export const workspaceTree = (
  workspaces: Array<ResolvedWorkspace>,
): WorkspaceTree => {
  return {};
};
