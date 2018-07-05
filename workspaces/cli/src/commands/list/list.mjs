import fs from 'fs';
import path from 'path';
import * as colors from 'wool/cli-colors';
import { localPackagesPath } from 'wool/utils';

export default async function run() {
  const namespaces = fs.readdirSync(localPackagesPath);

  console.log('Installed packages:\n');

  namespaces.forEach(namespace => {
    console.log(`  ${colors.white(namespace)}`);

    const packages = fs.readdirSync(path.join(localPackagesPath, namespace));
    packages.forEach(pkg => {
      const versions = fs.readdirSync(
        path.join(localPackagesPath, namespace, pkg),
      );
      console.log(
        `  ${colors.gray(namespace)}/${colors.cyan(pkg)} at ${versions
          .map(v => colors.blue(v))
          .join(', ')}`,
      );
    });

    console.log('');
  });
}
