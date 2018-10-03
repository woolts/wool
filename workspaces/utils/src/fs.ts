import * as fs from 'fs';
import { promisify } from 'util';

import { normaliseUrl } from './path';

export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);

export const readJson = (url: URL | string): any =>
  readFile(normaliseUrl(url)).then(buffer => JSON.parse(buffer.toString()));

// export const writeJson = (url: URL | string, data): any =>
//   writeFile(
//     new URL('wool.lock', normaliseUrl(url)),
//     JSON.stringify(data, null, 2),
//   );
