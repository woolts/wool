import { resolveWorkspaces } from 'wool/package';
import { assert, describe } from 'wool/test';
import * as path from 'path';

const single = path.join(
  // TODO: this should work
  // path.dirname(new URL(import.meta.url).pathname),
  './workspaces/package/tests',
  './fixtures/single',
);

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
  ]),
]);
