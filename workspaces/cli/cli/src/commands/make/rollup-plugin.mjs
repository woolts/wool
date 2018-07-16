import fs from 'fs';
import path from 'path';
import { resolve } from 'wool/loader';

export default function wool(options = {}) {
  return {
    name: 'wool',
    async resolveId(importee, importer) {
      const resolved = await resolve(
        importer ? importee : `./${importee}`,
        new URL(`file://${importer}`),
        specifier => {
          if (
            specifier.startsWith('./') &&
            !specifier.endsWith('.mjs') &&
            !specifier.endsWith('.js')
          ) {
            let url = path.resolve(
              process.cwd(),
              path.dirname(importer),
              `${specifier}.mjs`,
            );

            if (!fs.existsSync(url)) {
              url = url.replace('.mjs', '/index.mjs');
            }

            return { url };
          }
        },
      );

      return resolved ? resolved.url.replace('file://', '') : null;
    },
  };
}
