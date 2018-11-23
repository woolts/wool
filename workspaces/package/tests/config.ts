import { readPackageConfig, readPackageLock } from 'wool/package';
import { assert, attempt, describe } from 'wool/test';
import * as path from 'path';

const single = path.join(
  // TODO: this should work
  // path.dirname(new URL(import.meta.url).pathname),
  './workspaces/package/tests',
  './fixtures/single',
);

const invalid = path.join(
  // TODO: this should work
  // path.dirname(new URL(import.meta.url).pathname),
  './workspaces/package/tests',
  './fixtures/invalid',
);

const withDependencies = path.join(
  // TODO: this should work
  // path.dirname(new URL(import.meta.url).pathname),
  './workspaces/package/tests',
  './fixtures/with-dependencies',
);

export default describe('config', [
  describe('readPackageConfig', [
    assert({
      given: 'a directory of a package',
      should: 'return the package config',
      actual: () => readPackageConfig(single),
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
      actual: attempt(() => readPackageConfig(invalid)),
      expected: new Error(),
    }),
  ]),
  describe('readPackageLock', [
    assert({
      given: 'a directory of a package',
      should: 'return the package lock',
      actual: () => readPackageLock(withDependencies),
      expected: {
        'fixtures/other': {
          version: '1.3.6',
          constraint: '1.0.0 <= v < 2.0.0',
          registry: 'https://registry.wool.org',
          size: 12345,
        },
        'fixtures/other-child': {
          version: '1.23.45',
          constraint: '1.0.0 <= v < 2.0.0',
          registry: 'https://registry.wool.org',
          size: 12345,
        },
      },
    }),
    assert({
      given: 'a directory with no lock',
      should: 'throw an error',
      actual: attempt(() => readPackageLock(invalid)),
      expected: new Error(),
    }),
  ]),
]);
