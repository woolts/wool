import { assert, describe, isEqual } from 'wool/test';
import * as path from 'path';

export default describe('test', [
  describe('isEqual', [
    assert({
      given: 'null == null',
      should: 'return true',
      actual: isEqual(null, null),
      expected: true,
    }),
    assert({
      given: 'null == undefined',
      should: 'return true',
      actual: isEqual(null, undefined),
      expected: true,
    }),
    assert({
      given: '0 == 0',
      should: 'return true',
      actual: isEqual(0, 0),
      expected: true,
    }),
    assert({
      given: '1 == 1',
      should: 'return true',
      actual: isEqual(1, 1),
      expected: true,
    }),
    assert({
      given: '1 == 2',
      should: 'return false',
      actual: isEqual(1, 2),
      expected: false,
    }),
    assert({
      given: '1 == "1"',
      should: 'return false',
      actual: isEqual(1, '1'),
      expected: false,
    }),
    assert({
      given: '[] == []',
      should: 'return true',
      actual: isEqual([], []),
      expected: true,
    }),
    assert({
      given: '["a"] == ["a"]',
      should: 'return true',
      actual: isEqual(['a'], ['a']),
      expected: true,
    }),
    assert({
      given: '["a"] == ["b"]',
      should: 'return false',
      actual: isEqual(['a'], ['b']),
      expected: false,
    }),
    assert({
      given: '["a"] == ["a", "b"]',
      should: 'return false',
      actual: isEqual(['a'], ['a', 'b']),
      expected: false,
    }),
    assert({
      given: '{} == {}',
      should: 'return true',
      actual: isEqual({}, {}),
      expected: true,
    }),
    assert({
      given: '{a:1} == {a:1}',
      should: 'return true',
      actual: isEqual({ a: 1 }, { a: 1 }),
      expected: true,
    }),
    assert({
      given: '{a:1} == {a:2}',
      should: 'return false',
      actual: isEqual({ a: 1 }, { a: 2 }),
      expected: false,
    }),
    assert({
      given: '{a:1} == {a:1,b:1}',
      should: 'return false',
      actual: isEqual({ a: 1 }, { a: 1, b: 1 }),
      expected: false,
    }),
    assert({
      given: '{a:1,b:2} == {a:1,b:2}',
      should: 'return true',
      actual: isEqual({ a: 1, b: 2 }, { a: 1, b: 2 }),
      expected: true,
    }),
  ]),
]);
