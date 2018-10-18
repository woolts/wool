import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

import { normalisePath, normaliseUrl } from './path';

const IGNORE_FILES = ['.DS_Store'];

export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const stat = promisify(fs.stat);
export const readDir = promisify(fs.readdir);

export const readJson = (url: URL | string): any =>
  readFile(normaliseUrl(url)).then(buffer => JSON.parse(buffer.toString()));

export const readJsonSync = (url: URL | string): any =>
  JSON.parse(fs.readFileSync(normaliseUrl(url)).toString());

// export const writeJson = (url: URL | string, data): any =>
//   writeFile(
//     new URL('wool.lock', normaliseUrl(url)),
//     JSON.stringify(data, null, 2),
//   );

export const dirSize = (url: URL | string) =>
  readDir(normalisePath(url)).then(files =>
    files.filter(f => !IGNORE_FILES.includes(f)).reduce((promise, fileName) => {
      const filePath = path.join(normalisePath(url), fileName);
      return promise.then(sum =>
        stat(filePath).then(stats => {
          if (stats.isDirectory()) {
            return dirSize(filePath).then(s => sum + s);
          }
          return fileSize(filePath).then(s => sum + s);
        }),
      );
    }, Promise.resolve(0)),
  );

export const dirSizeSync = (url: URL | string) => {
  const files = fs
    .readdirSync(normalisePath(url))
    .filter(f => !IGNORE_FILES.includes(f));
  let sum = 0;

  files.forEach(fileName => {
    const filePath = path.join(normalisePath(url), fileName);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      sum += dirSizeSync(filePath);
    } else {
      sum += fileSizeSync(filePath);
    }
  });

  return sum;
};

export const fileSize = (url: URL | string) =>
  stat(normalisePath(url)).then(stats => stats.size);

export const fileSizeSync = (url: URL | string) =>
  fs.statSync(normalisePath(url)).size;
