import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import util from 'util';

import cwd from './cwd';

const woolUrl = new URL(`file://${process.env.WOOL_PATH}/`);
const woolPackagesUrl = new URL('packages/', woolUrl);

const cwdUrl = new URL(`file://${cwd}`);
const entryUrl = new URL(process.env.WOOL_ENTRY, cwdUrl);

const TRACE = process.argv.includes('--wool-trace');
const trace = (...args) => {
  if (TRACE) console.log('wool:trace --', ...args);
};

const resolved = {};

const readPackageConfig = async url => {
  try {
    return JSON.parse(
      await util.promisify(fs.readFile)(new URL('wool.json', url)),
    );
  } catch (err) {
    // if (err.code !== 'ENOENT')
    throw err;
  }
};

const readPackageLock = async url => {
  try {
    return JSON.parse(
      await util.promisify(fs.readFile)(new URL('wool.lock', url)),
    );
  } catch (err) {
    // if (err.code !== 'ENOENT')
    throw err;
  }
};

export async function resolve(specifier, parentModuleUrl, defaultResolver) {
  // If this is a file path or non-namespaced specifier
  if (
    specifier.startsWith('/') ||
    specifier.startsWith('.') ||
    !specifier.includes('/')
  ) {
    const resolvedSpecifierUrl = new URL(
      specifier,
      parentModuleUrl || entryUrl,
    );

    // Check if it is a typescript file
    if (resolvedSpecifierUrl.href.endsWith('.ts')) {
      throw new Error('Can not handle typescript at the moment');
    }

    trace(specifier, 'resolving with default resolver');

    // Otherwise, use the default resolver
    return defaultResolver(specifier, parentModuleUrl);
  }

  if (resolved[specifier]) {
    trace(specifier, 'resolving from cache');
    return {
      url: resolved[specifier],
      format: 'esm',
    };
  }

  let entryLock;
  let searchDir = path.resolve(cwd, process.env.WOOL_ENTRY);
  let found = false;
  let searchDirs = [];
  while (!found && searchDir !== '/') {
    searchDir = path.dirname(searchDir);
    const searchDirUrl = new URL(`file://${searchDir}/`);
    searchDirs.push(searchDirUrl);
    try {
      entryLock = await readPackageLock(searchDirUrl);
      found = true;
    } catch (err) {
      // console.log(err);
      // throw err;
    }
  }

  if (!found) {
    throw new Error(
      `wool.lock not found at any of:\n  ${searchDirs
        .map(s => new URL('wool.lock', `${s}/`).href)
        .join('\n  ')}`,
    );
  }

  let specifierUrl;

  if (entryLock[specifier] && entryLock[specifier].workspace) {
    specifierUrl = new URL(entryLock[specifier].workspace, cwdUrl);
  } else if (entryLock[specifier]) {
    specifierUrl = new URL(
      `${specifier}/${entryLock[specifier].version}/`,
      woolPackagesUrl,
    );
  }

  // Try wool package resolution
  try {
    const config = await readPackageConfig(specifierUrl);
    const url = new URL(`${specifierUrl}/${config.entry}`).href;
    resolved[specifier] = url;
    trace(
      specifier,
      'resolving from',
      url.replace(new URL(woolPackagesUrl).href, '$WOOL_PATH/'),
    );
    return {
      url,
      format: 'esm',
    };
  } catch (err) {
    console.log(
      `\nCould not find wool module\n\n    ${specifier}\n    ${specifierUrl}\n\n`,
    );
    console.log(err);
    console.log('\n');

    trace(specifier, 'falling back to resolving with default resolver');

    // Otherwise use default resolver
    return defaultResolver(specifier, parentModuleUrl);
  }
}
