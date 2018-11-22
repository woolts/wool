import { preflight } from 'wool/package';
import { assert, describe } from 'wool/test';

export default describe('preflight', [
  assert({
    given: 'an empty list of workspaces',
    should: 'return an empty list',
    actual: preflight([]),
    expected: [],
  }),
]);
