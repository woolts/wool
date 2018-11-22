import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as colors from 'wool/colors';
import { errors, format } from 'wool/messages';
import { exec } from 'wool/process';
import * as semver from 'wool/semver';
import {
  dirSize,
  each,
  filter,
  flatten,
  get,
  getWorkspaceDependencyTree,
  keys,
  localPackagesPath,
  map,
  mapValues,
  normaliseUrl,
  pathToUrl,
  pickBy,
  pipe,
  readInstalledPackageConfig,
  readPackageConfig,
  readPackageLock,
  resolveWorkspaces,
  unique,
  writePackageConfig,
  writePackageLock,
  zipObject,
} from 'wool/utils';

import { startSpinner, stopSpinner } from '../spinners';

export default async function preflight({ args, options }) {
  const resolvedDir = path.resolve(process.cwd(), args.dir);
  const artifactsDir = path.join(resolvedDir, 'wool-stuff', 'build-artifacts');

  let workspaces = await resolveWorkspaces(resolvedDir);

  if (!areWorkspaceConstraintsValid(workspaces)) return;

  // TODO: return modified lock versions
  workspaces = normaliseLockVersions(workspaces);

  findMissingPackages(workspaces);
}

function areWorkspaceConstraintsValid(workspaces) {
  // 1. Discover conflicting dependencies across workspace `wool.json` files

  const direct = mapValues(get('config.dependencies.direct'), workspaces);
  const indirect = mapValues(get('config.dependencies.indirect'), workspaces);

  const constraints = {};
  each(parent => {
    if (!parent) return;
    each((constraint, name) => {
      constraints[name] = constraints[name] || [];
      constraints[name].push(constraint);
    }, parent);
  }, direct);

  const multipleConstraints = pickBy(c => unique(c).length > 1, constraints);
  const multipleConstraintsPackages = Object.keys(multipleConstraints);

  if (multipleConstraintsPackages.length === 0) return true;

  // TODO: move to errors catalogue
  const msg = [format.title('Configuration error', 'wool preflight'), ''];

  multipleConstraintsPackages.forEach(name => {
    msg.push(
      `The ${colors.cyan(
        name,
      )} package has multiple dependency constraints within your workspaces:`,
    );
    msg.push('');

    const table = [];

    each(workspace => {
      const constraint = get(`config.dependencies.direct.${name}`, workspace);
      if (constraint) {
        table.push([
          `    ${colors.white(workspace.config.name)}`,
          colors.red(constraint),
        ]);
      }
    }, workspaces);

    msg.push(format.table(table));
    msg.push('');
  });

  console.error(msg.join('\n'));
  process.exitCode = 1;

  return false;
}

function normaliseLockVersions(workspaces) {
  // 2. Discover conflicting versions across workspace `wool-lock.json` files

  const locks = mapValues(get('lock'), workspaces);

  const versions = {};
  each(parent => {
    each((dep, name) => {
      versions[name] = versions[name] || [];
      versions[name].push(dep.version);
    }, parent);
  }, locks);

  const multipleVersions = pickBy(v => unique(v).length > 1, versions);
  const multipleVersionsPackages = Object.keys(multipleVersions);

  if (multipleVersionsPackages.length === 0) return workspaces;

  multipleVersionsPackages.forEach(name => {
    const maxVersion = semver.findMaxVersion(multipleVersions[name]);

    each(workspace => {
      const version = get(`lock.${name}.version`, workspace);
      if (version && version !== maxVersion) {
        // TODO: writePackageLockSync
        // TODO: merge
        fs.writeFile(
          new URL('wool.lock', normaliseUrl(workspace.dir)),
          JSON.stringify(
            Object.assign({}, workspace.lock, {
              [name]: Object.assign({}, workspace.lock[name], {
                version: maxVersion,
              }),
            }),
            null,
            2,
          ),
          () => {
            // TODO: this message is unnecessary
            console.log(
              format.message(
                `${colors.cyan(
                  workspace.config.name,
                )} depended on ${colors.white(name)} at ${colors.red(
                  version,
                )}, I have upgraded it to ${colors.green(
                  maxVersion,
                )} to match the other workspaces in your project`,
              ),
            );
          },
        );
      }
    }, workspaces);
  });

  return workspaces;

  /*
  if (multipleVersionsPackages.length > 0) {
    // TODO: move to errors catalogue
    const msg = [format.title('Configuration error', 'wool make'), ''];

    multipleVersionsPackages.forEach(name => {
      msg.push(
        `The ${colors.cyan(
          name,
        )} package has multiple versions within your workspaces:`,
      );
      msg.push('');

      const table = [];

      Object.keys(workspaces).forEach(w => {
        const version = get(`lock.${name}.version`, workspaces[w]);
        if (version) {
          table.push([
            `    ${colors.white(workspaces[w].config.name)}`,
            colors.red(version),
          ]);
        }
      });

      msg.push(format.table(table));
    });

    console.error(msg.join('\n'));
  }
  */

  return workspaces;
}

function findMissingPackages(workspaces) {
  const direct = mapValues(get('config.dependencies.direct'), workspaces);
  const indirect = mapValues(get('config.dependencies.indirect'), workspaces);
  const locks = mapValues(get('lock'), workspaces);

  // const getDependencies = map(keys);
  // const dependencies = unique(
  //   flatten([getDependencies(direct), getDependencies(indirect)]),
  // );
  // const lockDependencies = unique(flatten(map(Object.keys, locks)));

  // debug(dependencies);
  // debug(lockDependencies);
}

const debug = str => console.log(JSON.stringify(str, null, 2));
