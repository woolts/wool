import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import util from 'util';

import cwd from './cwd';
import __dirname from './dirname';

const baseHref = `file://${__dirname}/`;
// const homeHref = 'file://~/';
const homeHref = path.join(baseHref, '..', '__mock-home');
const baseWoolHref = path.join(homeHref, '.wool', 'packages');

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

export async function resolve(specifier, parentModuleUrl, defaultResolver) {
  // If this is a file path, use the default resolver
  if (specifier.startsWith('/') || specifier.startsWith('.')) {
    return defaultResolver(specifier, parentModuleUrl);
  }

  let entryConfig;
  if (parentModuleUrl) {
    entryConfig = await readPackageConfig(path.dirname(parentModuleUrl));
  }

  const specifierHref = path.join(
    baseWoolHref,
    specifier,
    entryConfig.dependencies[specifier].version,
  );

  // Try wool package resolution
  try {
    const config = await readPackageConfig(specifierHref);
    const url = new URL(path.join(specifierHref, config.entry)).href;
    return {
      url,
      parentModuleUrl: parentModuleUrl || url,
      format: 'esm',
    };
  } catch (err) {
    console.log(
      `\nCould not find wool module\n\n    ${specifier}\n    ${specifierHref}\n\n`,
    );
    // Otherwise use default resolver
    return defaultResolver(specifier, parentModuleUrl);
  }
}
