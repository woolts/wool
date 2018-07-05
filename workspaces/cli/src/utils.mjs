import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export const woolPath = process.env.WOOL_PATH;
export const localPackagesPath = path.join(woolPath, 'packages');
export const woolUrl = new URL(`file://${process.env.WOOL_PATH}`);
export const localPackagesUrl = new URL('./packages/', woolUrl);

const pathToUrl = p => new URL(`file://${path.resolve(p)}`);
const urlToPath = u => u.href.replace('file://', '');

export const readPackageConfig = async url => {
  try {
    return JSON.parse(await readFile(new URL('wool.json', url)));
  } catch (err) {
    // if (err.code !== 'ENOENT')
    throw err;
  }
};

export const writePackageConfig = async (url, config) => {
  try {
    await writeFile(new URL('wool.json', url), JSON.stringify(config, null, 2));
  } catch (err) {
    // if (err.code !== 'ENOENT')
    throw err;
  }
};

export const readActivePackageConfig = () =>
  readPackageConfig(pathToUrl(process.cwd()));

export const writeActivePackageConfig = config =>
  readPackageConfig(pathToUrl(process.cwd()), config);
