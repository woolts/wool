import { resolveWorkspaces } from 'wool/package';
import { assert, describe } from 'wool/test';
import * as path from 'path';

const single = path.join(
  // TODO: this should work
  // path.dirname(new URL(import.meta.url).pathname),
  './workspaces/package/tests',
  './fixtures/single',
);

const nested = path.join('./workspaces/package/tests', './fixtures/nested');

export default describe('workspaces', [
  describe('resolveWorkspaces', [
    assert({
      given: 'a workspace with a single package',
      should: 'resolve the single package',
      actual: () => resolveWorkspaces(single),
      expected: {
        'fixtures/single': {
          config: {
            name: 'fixtures/single',
            version: '1.2.0',
            entry: 'index.ts',
            dependencies: {
              direct: {},
              indirect: {},
            },
          },
          dir: 'workspaces/package/tests/fixtures/single',
          version: '1.2.0',
          lock: {},
        },
      },
    }),
    assert({
      given: 'a workspace with nested packages',
      should: 'resolve the nested packages',
      actual: () => resolveWorkspaces(nested),
      expected: {
        'fixtures/nested-with-version': {
          config: {
            name: 'fixtures/nested-with-version',
            version: '2.0.0',
            entry: 'index.ts',
            dependencies: { direct: {}, indirect: {} },
          },
          dir: 'workspaces/package/tests/fixtures/nested/with-version',
          lock: {},
          version: '2.0.0',
        },
        'fixtures/nested-without-version': {
          config: {
            name: 'fixtures/nested-without-version',
            entry: 'index.ts',
            dependencies: { direct: {}, indirect: {} },
          },
          dir: 'workspaces/package/tests/fixtures/nested/without-version',
          lock: {},
          version: '1.0.0',
        },
        'fixtures/nested-with-dependencies': {
          config: {
            name: 'fixtures/nested-with-dependencies',
            dependencies: {
              direct: { 'fixtures/nested-with-version': '2.0.0 <= v < 3.0.0' },
              indirect: {},
            },
          },
          dir: 'workspaces/package/tests/fixtures/nested/with-dependencies',
          lock: {},
          version: '1.0.0',
        },
      },
    }),
  ]),
]);
