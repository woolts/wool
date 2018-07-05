import fs from 'fs';
import path from 'path';
import { localPackagesPath } from 'wool/utils';

export default async function run() {
  const namespaces = fs.readdirSync(localPackagesPath);

  console.log('Installed packages:\n');

  namespaces.forEach(namespace => {
    console.log(`  ${namespace}`);

    const packages = fs.readdirSync(path.join(localPackagesPath, namespace));
    packages.forEach(pkg => {
      console.log(`    ${namespace}/${pkg}`);

      const versions = fs.readdirSync(
        path.join(localPackagesPath, namespace, pkg),
      );
      console.log(`      ${versions.join(', ')}`);
    });

    console.log('');
  });
}
