import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

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
  packages = await readFile(packagesPath).then(buffer => buffer.toJSON().data);
}
