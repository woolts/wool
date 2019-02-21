import { action } from 'wool/terminal';
import { assert, attempt, describe } from 'wool/test';

export default describe('action', [
  assert({
    given: 'no args or flags',
    should: 'call the function',
    actual: () => {
      let out;
      action(() => {
        out = 'actual';
      })({ argv: ['program', 'command'] });
      return out;
    },
    expected: 'actual',
  }),
  assert({
    given: '--help',
    should: 'output the help',
    actual: () => {
      let out;
      action(() => {
        out = 'actual';
      })({ argv: ['program', 'command'] });
      return out;
    },
    expected: 'actual',
  }),
]);
