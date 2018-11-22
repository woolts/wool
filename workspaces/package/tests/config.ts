import { readPackageConfig } from 'wool/package';
import { assert, attempt, describe } from 'wool/test';
import * as path from 'path';

export default describe('config', [
  describe('readPackageConfig', [
    assert({
      given: 'a directory of a package',
      should: 'return the package config',
      actual: () =>
        readPackageConfig(
          path.join(
            // TODO: this should work
            // path.dirname(new URL(import.meta.url).pathname),
            './workspaces/package/tests',
            './fixtures/single',
          ),
        ),
      expected: {
        name: 'fixtures/single',
        entry: 'index.ts',
        version: '1.2.0',
        dependencies: { direct: {}, indirect: {} },
      },
    }),
    assert({
      given: 'a directory with an invalid config',
      should: 'throw an error',
      actual: attempt(() =>
        readPackageConfig(
          path.join(
            // TODO: this should work
            // path.dirname(new URL(import.meta.url).pathname),
            './workspaces/package/tests',
            './fixtures/invalid',
          ),
        ),
      ),
      expected: new Error(),
    }),
  ]),
]);
