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

  // If this is a file path, use the default resolver
  if (specifier.startsWith('/') || specifier.startsWith('.')) {
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
  if (process.env.WOOL_ENTRY) {
    const entryDir = `file://${path.dirname(
      path.join(cwd, process.env.WOOL_ENTRY),
    )}`;
    entryConfig = await readPackageConfig(entryDir);
    entryLock = await readPackageLock(entryDir);
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
