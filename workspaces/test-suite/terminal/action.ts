import { action } from 'wool/terminal';
import { assert, attempt, describe } from 'wool/test';

export default describe('action', [
  assert({
    given: 'an function',
    should: 'call the function',
    actual: () => {
      let out;
      action(() => {
        out = 'actual';
      })();
      return out;
    },
    expected: 'actual',
  }),
]);
