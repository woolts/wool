import {
  getWorkspaceDependencyTree,
  readPackageConfig,
  readPackageLock,
  resolveWorkspaces,
} from 'wool/utils';

export default async function dependencyTree(dir) {
  const { tree, looped } = await getWorkspaceDependencyTree(
    await resolveWorkspaces(dir),
  );

  if (looped.length > 0) {
    throw new Error('Workspace dependency loop');
  }

  tree.forEach(pkg => {
    console.log(pkg.config.name);
    if (pkg.config.dependencies && pkg.config.dependencies.direct) {
      Object.keys(pkg.config.dependencies.direct).forEach(dep => {
        console.log(`    ${dep}`);
      });
    }
    if (pkg.config.dependencies && pkg.config.dependencies.indirect) {
      Object.keys(pkg.config.dependencies.indirect).forEach(dep => {
        console.log(`    ${dep}`);
      });
    }
  });

  return [];
}
