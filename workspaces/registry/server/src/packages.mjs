import fs from 'fs';
import path from 'path';
import util from 'util';

const readFile = util.promisify(fs.readFile);

const woolUrl = new URL(`file://${process.env.WOOL_PATH}`);
const registriesUrl = new URL('./registries/', woolUrl);

let packages = [];

export function list() {
  return packages;
}

export function count() {
  return Object.keys(packages).length;
}

export async function refresh(dir) {
  const packagesPath = new URL(path.join(dir, 'packages.json'), registriesUrl);
  packages = JSON.parse(await readFile(packagesPath));
}
