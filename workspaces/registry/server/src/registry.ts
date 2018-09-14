import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);

const [, , registryName] = process.argv;

if (!registryName) {
  throw new Error('Expected a registry name');
}

const woolUrl = new URL(`file://${process.env.WOOL_PATH}`);
const registriesUrl = new URL('./registries/', woolUrl);
const registryUrl = new URL(`${registryName}/`, registriesUrl);
const registryConfigUrl = new URL('./registry.json', registryUrl);

export default () =>
  readFile(registryConfigUrl).then(buffer => buffer.toJSON().data);
