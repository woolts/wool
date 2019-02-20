import { Type } from 'wool/core';
import { assert, describe } from 'wool/test';

export default describe('Type', [
  describe('Type.custom', [
    assert({
      given: 'a type',
      should: 'match',
      actual: Type.custom({
        Hello: [],
      }).match('Hello', {
        Hello: () => 'hello',
      }),
      expected: 'hello',
    }),
  ]),
]);
