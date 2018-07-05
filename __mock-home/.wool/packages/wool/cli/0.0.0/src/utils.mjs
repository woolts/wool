import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export const woolPath = process.env.WOOL_PATH;
export const localPackagesPath = path.join(woolPath, 'packages');
export const woolUrl = new URL(`file://${process.env.WOOL_PATH}`);
export const localPackagesUrl = new URL('./packages/', woolUrl);

const pathToUrl = p => new URL(`file://${path.resolve(p)}/`);
const urlToPath = u => u.href.replace('file://', '');

export const readPackageConfig = async url =>
  JSON.parse(await readFile(new URL('wool.json', url)));

export const readPackageVersionLock = async url =>
  JSON.parse(await readFile(new URL('wool.version', url)));

export const writePackageConfig = (url, config) =>
  writeFile(new URL('wool.json', url), JSON.stringify(config, null, 2));

export const writePackageVersionLock = (url, config) =>
  writeFile(new URL('wool.version', url), JSON.stringify(config, null, 2));

export const readActivePackageConfig = () =>
  readPackageConfig(pathToUrl(process.cwd()));

export const readActivePackageVersionLock = () =>
  readPackageVersionLock(pathToUrl(process.cwd()));

export const writeActivePackageConfig = config =>
  writePackageConfig(pathToUrl(process.cwd()), config);

export const writeActivePackageVersionLock = config =>
  writePackageVersionLock(pathToUrl(process.cwd()), config);
