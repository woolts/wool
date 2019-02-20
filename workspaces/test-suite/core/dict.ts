import { Dict } from 'wool/core';
import { assert, describe } from 'wool/test';

export default describe('Dict', [
  describe('Dict.empty', [
    assert({
      given: 'called',
      should: 'return an empty dict',
      actual: Dict.empty(),
      expected: new Map(),
    }),
  ]),
  describe('Dict.singleton', [
    assert({
      given: 'a key and a value',
      should: 'return a dict with that entry',
      actual: Dict.get('hello', Dict.singleton('hello', 'world')),
      expected: 'world',
    }),
  ]),
  describe('Dict.insert', [
    assert({
      given: 'a key and a value',
      should: 'return a dict with that entry',
      actual: Dict.get(
        'bonjour',
        Dict.insert('bonjour', 'monde', Dict.singleton('hello', 'world')),
      ),
      expected: 'monde',
    }),
  ]),
  describe('Dict.update', [
    assert({
      given: 'a key and fn',
      should: 'update the value at the key',
      actual: Dict.get(
        'hello',
        Dict.update(
          'hello',
          v => `updated:${v}`,
          Dict.singleton('hello', 'world'),
        ),
      ),
      expected: 'updated:world',
    }),
  ]),
  describe('Dict.remove', [
    assert({
      given: 'a key',
      should: 'return a dict without that entry',
      actual: Dict.member(
        'hello',
        Dict.remove('hello', Dict.singleton('hello', 'world')),
      ),
      expected: false,
    }),
  ]),
  describe('Dict.isEmpty', [
    assert({
      given: 'an empty dict',
      should: 'return true',
      actual: Dict.isEmpty(Dict.empty()),
      expected: true,
    }),
    assert({
      given: 'an non-empty dict',
      should: 'return false',
      actual: Dict.isEmpty(Dict.singleton('hello', 'world')),
      expected: false,
    }),
  ]),
  describe('Dict.member', [
    assert({
      given: 'an existing member',
      should: 'return true',
      actual: Dict.member('hello', Dict.singleton('hello', 'world')),
      expected: true,
    }),
    assert({
      given: 'a non-existing member',
      should: 'return false',
      actual: Dict.member('bonjour', Dict.singleton('hello', 'world')),
      expected: false,
    }),
  ]),
  // ...
  describe('Dict.toList', [
    assert({
      given: 'a dict',
      should: 'return a list of tuples',
      actual: Dict.toList(Dict.singleton('hello', 'world')),
      expected: [['hello', 'world']],
    }),
  ]),
]);
