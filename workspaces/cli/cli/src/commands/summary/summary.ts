import * as fs from 'fs';
import * as colors from 'wool/colors';
import { format } from 'wool/messages';
import {
  dirSizeSync,
  localPackagesUrl,
  readPackageConfigSync,
  urlToPath,
} from 'wool/utils';

import { startSpinner, stopSpinner } from '../spinners';

const IGNORE_FILES = ['.DS_Store'];

export default async function summary() {
  // startSpinner(() => '🔍 Summarising...');

  const installedSize = dirSizeSync(localPackagesUrl);

  const packages = await getInstalledPackages();

  const numPackages = Object.values(packages).reduce(
    (sum: number, pkg) => sum + Object.keys(pkg).length,
    0,
  );
  const latestSize = Object.values(packages).reduce(
    (sum: number, pkg) =>
      sum +
      Object.values(pkg)
        .slice(0, Object.values(pkg).length)
        .reduce((sum2: number, version) => sum2 + version.size, 0),
    0,
  );

  // stopSpinner(() => '');

  const dirLabel = urlToPath(localPackagesUrl).replace(process.env.HOME, '~');

  console.log(format.title('Wool Summary', dirLabel, colors.cyan));
  console.log('');

  console.log(
    format.message(
      `You have ${colors.cyan(
        numPackages,
      )} packages installed, coming to a total of ${colors.magenta(
        formatSize(installedSize),
      )}.`,
    ),
  );

  console.log('');

  console.log(
    format.message(
      `If you ran ${colors.white(
        'wool clean --keep-latest',
      )} you would remove ${colors.white(
        formatSize(installedSize - latestSize),
      )} reducing your installed size to ${colors.magenta(
        formatSize(latestSize),
      )}. Run ${colors.white(
        'wool list --all',
      )} to see all installed packages and their versions.`,
    ),
  );

  // getInstalledPackages();
}

// TODO: move to wool/utils
async function getInstalledPackages() {
  const packages = {};

  const namespaces = fs
    .readdirSync(localPackagesUrl)
    .filter(f => !IGNORE_FILES.includes(f));

  namespaces.forEach(namespace => {
    const packageNames = fs
      .readdirSync(new URL(namespace, localPackagesUrl))
      .filter(f => !IGNORE_FILES.includes(f));

    packageNames.forEach(packageName => {
      packages[packageName] = {};

      const packageNameUrl = new URL(
        `${namespace}/${packageName}/`,
        localPackagesUrl,
      );
      const versions = fs
        .readdirSync(packageNameUrl)
        .filter(f => !IGNORE_FILES.includes(f));

      versions.forEach(version => {
        const versionUrl = new URL(`${version}/`, packageNameUrl);
        const versionSize = dirSizeSync(versionUrl);
        packages[packageName][version] = {
          config: readPackageConfigSync(versionUrl),
          size: versionSize,
        };
      });
    });
  });

  return packages;

  /*
  const packages = await namespaces.reduce(
    (promise, namespace: string) =>
      promise.then(async acc => {
        const names = (await readDir(new URL(namespace, localPackagesUrl)))
          .filter(f => !IGNORE_FILES.includes(f))
          .map(pkg => `${namespace}/${pkg}/`);

        const versions =

        const configs = await Promise.all(
          names.map(name => readPackageConfig(new URL(name, localPackagesUrl))),
        );

        return [...acc, ...configs];
      }),
    Promise.resolve([]),
  );
  */

  // console.log(packages);
}

function formatSize(size: number): string {
  if (size < 1024) {
    return `${size} bytes`;
  }

  return `${Math.round(size / 102.4) / 10}kb`;
}
