import { Dict, List, String, Tuple } from 'wool/core';
import { ResolvedWorkspace } from './workspaces';

/**
 * Preflight checks for each workspace:
 *
 * 1.
 *  a. EITHER has a valid name
 *    MUST NOT be one of:
 *      i. `wool`
 *      ii. `node`
 *    MUST be in the format `namespace/package`
 *  b. OR has `private: true`
 * 2. All dependencies are installed
 */

type PreflightResult =
  | 'ok'
  | Tuple.Tuple<'configError', string>
  | Tuple.Tuple<'missingDependencies', string>;

export default function preflight(
  workspaces: Dict.Dict<string, ResolvedWorkspace>,
): List<Tuple.Tuple<ResolvedWorkspace, PreflightResult>> {
  return List.map(([name, workspace]) => {
    if (!workspace.config.name && !workspace.config.private) {
      // TODO: encode this in a type?
      return Tuple.pair(
        workspace,
        Tuple.pair('configError', 'Must have name or private'),
      );
    }

    if (workspace.config.name.startsWith('wool/')) {
      return Tuple.pair(
        workspace,
        Tuple.pair('configError', 'Can not be under the `wool` namespace'),
      );
    }

    if (workspace.config.name.startsWith('node/')) {
      return Tuple.pair(
        workspace,
        Tuple.pair('configError', 'Can not be under the `node` namespace'),
      );
    }

    const parts = String.split('/', workspace.config.name);
    if (List.length(parts) !== 2) {
      return Tuple.pair(
        workspace,
        Tuple.pair(
          'configError',
          'Package name must be in the format `namespace/package`',
        ),
      );
    }

    return Tuple.pair(workspace, 'ok');
  }, Dict.toList(workspaces));
}
