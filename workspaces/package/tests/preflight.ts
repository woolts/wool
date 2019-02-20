import { Dict, List } from 'wool/core';
import { preflight, resolveWorkspaces } from 'wool/package';
import { assert, describe } from 'wool/test';
import * as path from 'path';

const single = path.join(
  // TODO: this should work
  // path.dirname(new URL(import.meta.url).pathname),
  './workspaces/package/tests',
  './fixtures/single',
);

export default describe('preflight', [
  assert({
    given: 'an empty dict of workspaces',
    should: 'return an empty list',
    actual: preflight(Dict.empty()),
    expected: [],
  }),
  assert({
    given: 'valid resolved workspaces',
    should: 'return a list with `ok` results',
    actual: () => resolveWorkspaces(single).then(preflight),
    expected: [
      [
        {
          config: {
            name: 'fixtures/single',
            version: '1.2.0',
            entry: 'index.ts',
            dependencies: { direct: {}, indirect: {} },
          },
          dir: 'workspaces/package/tests/fixtures/single',
          lock: {},
          version: '1.2.0',
        },
        'ok',
      ],
    ],
  }),
  assert({
    given: 'invalid workspace name',
    should: 'return a list with `configError` results',
    actual: preflight(
      Dict.singleton('wool/invalid', { config: { name: 'wool/invalid' } }),
    ),
    expected: [
      [
        { config: { name: 'wool/invalid' } },
        ['configError', 'Can not be under the `wool` namespace'],
      ],
    ],
  }),
]);
