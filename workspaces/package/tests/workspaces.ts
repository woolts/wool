import { Dict } from 'wool/core';
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
const withDependencies = path.join(
  './workspaces/package/tests',
  './fixtures/with-dependencies',
);

export default describe('workspaces', [
  describe('resolveWorkspaces', [
    assert({
      given: 'a workspace with a single package',
      should: 'resolve the single package',
      actual: () => resolveWorkspaces(single),
      expected: Dict.singleton('fixtures/single', {
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
      }),
    }),
    assert({
      given: 'a workspace with nested packages',
      should: 'resolve the nested packages',
      actual: () => resolveWorkspaces(nested),
      expected: Dict.fromList([
        [
          'fixtures/nested-with-version',
          {
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
        ],
        [
          'fixtures/nested-without-version',
          {
            config: {
              name: 'fixtures/nested-without-version',
              entry: 'index.ts',
              dependencies: { direct: {}, indirect: {} },
            },
            dir: 'workspaces/package/tests/fixtures/nested/without-version',
            lock: {},
            version: '1.0.0',
          },
        ],
        [
          'fixtures/nested-with-dependencies',
          {
            config: {
              name: 'fixtures/nested-with-dependencies',
              dependencies: {
                direct: {
                  'fixtures/nested-with-version': '2.0.0 <= v < 3.0.0',
                },
                indirect: {},
              },
            },
            dir: 'workspaces/package/tests/fixtures/nested/with-dependencies',
            lock: {},
            version: '1.0.0',
          },
        ],
      ]),
    }),
    assert({
      given: 'a workspace with dependencies',
      should: 'resolve the dependencies',
      actual: () => resolveWorkspaces(withDependencies),
      expected: Dict.fromList([
        [
          'fixtures/with-dependencies',
          {
            config: {
              name: 'fixtures/with-dependencies',
              version: '1.2.0',
              entry: 'index.ts',
              dependencies: {
                direct: { 'other/hello': '1.0.0 <= v < 2.0.0' },
                indirect: { 'other/hello-child': '1.0.0 <= v < 2.0.0' },
              },
            },
            dir: 'workspaces/package/tests/fixtures/with-dependencies',
            lock: {
              'other/hello': {
                version: '1.3.6',
                constraint: '1.0.0 <= v < 2.0.0',
                registry: 'https://registry.wool.org',
                size: 12345,
              },
              'other/hello-child': {
                version: '1.23.45',
                constraint: '1.0.0 <= v < 2.0.0',
                registry: 'https://registry.wool.org',
                size: 12345,
              },
            },
            version: '1.2.0',
          },
        ],
      ]),
    }),
  ]),
]);
