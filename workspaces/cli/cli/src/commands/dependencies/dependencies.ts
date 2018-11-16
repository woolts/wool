import * as colors from 'wool/colors';
import * as semver from 'wool/semver';
import {
  getWorkspaceDependencyTree,
  map,
  mapValues,
  readPackageConfig,
  readPackageLock,
  resolveWorkspaces,
  unique,
} from 'wool/utils';

// dir: string;
// version: string;
// private: boolean;
// parentDir: string;
// config: WoolConfig;
// lock: WoolLock;

export default async function dependencyTree({ args }) {
  const workspaces = await resolveWorkspaces(args.dir);

  console.log(JSON.stringify(workspaces, null, 2));
  console.log('');
  console.log('');

  const workspaceNames = Object.keys(workspaces);

  let deps = {};

  workspaceNames.forEach(name => {
    const workspace = workspaces[name];

    if (!workspace.lock) {
      return;
    }

    Object.keys(workspace.lock).forEach(key => {
      if (!workspaceNames.includes(name)) {
        return;
      }
      deps[key] = deps[key] || { versions: [], constraints: [], locks: {} };

      deps[key].versions.push(workspace.lock[key].version);
      deps[key].constraints.push(workspace.lock[key].constraint);

      deps[key].locks[key] = workspace.lock;
    });
  });

  deps = mapValues(
    dep => ({
      ...dep,
      versions: unique(dep.versions),
      constraints: unique(dep.constraints),
    }),
    deps,
  );

  Object.keys(deps).forEach(name => {
    const dep = deps[name];

    const mapConstraintsColor = map(
      dep.constraints.length > 1 ? colors.red : colors.blue,
    );
    const mapVersionsColor = map(
      (v, i) =>
        i === dep.versions.length - 1 ? colors.blue(v) : colors.red(v),
    );

    console.log(colors.cyan(name));
    console.log(
      `    Constraints: ${mapConstraintsColor(dep.constraints).join(', ')}`,
    );
    console.log(
      `    Versions: ${mapVersionsColor(
        dep.versions.sort(semver.compareVersions),
      ).join(', ')}`,
    );
    console.log('');
  });

  /*
  const { tree, looped } = await getWorkspaceDependencyTree(
    await resolveWorkspaces(args.dir),
  );

  if (looped.length > 0) {
    throw new Error('Workspace dependency loop');
  }

  let deps = {};

  tree.forEach(pkg => {
    deps[pkg.config.name] = deps[pkg.config.name] || [];
    deps[pkg.config.name].push(pkg.version);

    if (pkg.config.dependencies && pkg.config.dependencies.direct) {
      Object.keys(pkg.config.dependencies.direct).forEach(dep => {
        deps[dep] = deps[dep] || [];
        deps[dep].push(pkg.config.dependencies.direct[dep]);
      });
    }
    if (pkg.config.dependencies && pkg.config.dependencies.indirect) {
      Object.keys(pkg.config.dependencies.indirect).forEach(dep => {
        deps[dep] = deps[dep] || [];
        deps[dep].push(pkg.config.dependencies.direct[dep]);
      });
    }
  });

  deps = mapValues(unique, deps);

  console.log(JSON.stringify(deps, null, 2));
  */
}
