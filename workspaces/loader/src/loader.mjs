import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import util from 'util';

import cwd from './cwd';
import __dirname from './dirname';

const baseHref = `file://${__dirname}/`;
const woolHref = `file://${process.env.WOOL_PATH}`;
const woolPackagesHref = `${woolHref}/packages`;

const TRACE = process.argv.includes('--wool-trace');
const trace = (...args) => {
  if (TRACE) console.log('wool:trace --', ...args);
};

const resolved = {};

const readPackageConfig = async url => {
  try {
    return JSON.parse(
      await util.promisify(fs.readFile)(new URL(path.join(url, 'wool.json'))),
    );
  } catch (err) {
    // if (err.code !== 'ENOENT')
    throw err;
  }
};

const readPackageLock = async url => {
  try {
    return JSON.parse(
      await util.promisify(fs.readFile)(
        new URL(path.join(url, 'wool-lock.json')),
      ),
    );
  } catch (err) {
    // if (err.code !== 'ENOENT')
    throw err;
  }
};

export async function resolve(specifier, parentModuleUrl, defaultResolver) {
  trace(specifier);

  // If this is a file path or non-namespaced specifier, use the default resolver
  if (
    specifier.startsWith('/') ||
    specifier.startsWith('.') ||
    !specifier.includes('/')
  ) {
    return defaultResolver(specifier, parentModuleUrl);
  }

  if (resolved[specifier]) {
    trace(specifier, '|', 'from cache');
    return {
      url: resolved[specifier],
      format: 'esm',
    };
  }

  let entryConfig;
  let entryLock;
  let entryDir = path.join(cwd, process.env.WOOL_ENTRY);
  let found = false;
  while (!found && entryDir !== '/') {
    entryDir = path.dirname(entryDir);
    const entryDirHref = `file://${entryDir}`;
    console.log(entryDirHref);
    try {
      entryConfig = await readPackageConfig(entryDirHref);
      entryLock = await readPackageLock(entryDirHref);
      found = true;
    } catch (err) {
      // ...
    }
  }

  const specifierHref = new URL(
    path.join(woolPackagesHref, specifier, entryLock[specifier].version),
  ).href;

  // Try wool package resolution
  try {
    const config = await readPackageConfig(specifierHref);
    const url = new URL(`${specifierHref}/${config.entry}`).href;
    trace(
      specifier,
      '|',
      url.replace(new URL(woolPackagesHref).href, '$WOOL_PATH'),
    );
    resolved[specifier] = url;
    return {
      url,
      format: 'esm',
    };
  } catch (err) {
    console.log(
      `\nCould not find wool module\n\n    ${specifier}\n    ${specifierHref}\n\n`,
    );
    console.log(err);
    console.log('\n');

    // Otherwise use default resolver
    return defaultResolver(specifier, parentModuleUrl);
  }
}
