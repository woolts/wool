import { Maybe } from 'wool/core';
import { assert, describe } from 'wool/test';

export default describe('Maybe', [
  describe('Maybe.just', [
    assert({
      given: 'a value',
      should: 'return that value',
      actual: Maybe.just('value'),
      expected: 'value',
    }),
  ]),

  describe('Maybe.nothing', [
    assert({
      given: 'called',
      should: 'return null',
      actual: Maybe.nothing(),
      expected: null,
    }),
  ]),

  describe('Maybe.withDefault', [
    assert({
      given: 'a default and nothing',
      should: 'return the default',
      actual: Maybe.withDefault('default', Maybe.nothing()),
      expected: 'default',
    }),
    assert({
      given: 'a default and a value',
      should: 'return the value',
      actual: Maybe.withDefault('default', Maybe.just('value')),
      expected: 'value',
    }),
  ]),

  describe('Maybe.map', [
    assert({
      given: 'nothing',
      should: 'return nothing',
      actual: Maybe.map(a => a, Maybe.nothing()),
      expected: Maybe.nothing(),
    }),
    assert({
      given: 'a value',
      should: 'return the mapped value',
      actual: Maybe.map(a => `mapped:${a}`, Maybe.just('value')),
      expected: 'mapped:value',
    }),
    assert({
      given: 'nested maps',
      should: 'return the final mapped value',
      actual: Maybe.map(
        a => `1:${a}`,
        Maybe.map(a => `0:${a}`, Maybe.just('value')),
      ),
      expected: '1:0:value',
    }),
    assert({
      given: 'nested maps with nothing',
      should: 'return nothing',
      actual: Maybe.map(a => a, Maybe.map(a => a, Maybe.nothing())),
      expected: Maybe.nothing(),
    }),
  ]),

  describe('Maybe.map2', [
    assert({
      given: 'two nothings',
      should: 'return nothing',
      actual: Maybe.map2(
        (a, b) => `${a}:${b}`,
        Maybe.nothing(),
        Maybe.nothing(),
      ),
      expected: Maybe.nothing(),
    }),
    assert({
      given: 'a nothing and a value',
      should: 'return nothing',
      actual: Maybe.map2(
        (a, b) => `${a}:${b}`,
        Maybe.nothing(),
        Maybe.just('two'),
      ),
      expected: Maybe.nothing(),
    }),
    assert({
      given: 'two values',
      should: 'return the mapped values',
      actual: Maybe.map2(
        (a, b) => `${a}:${b}`,
        Maybe.just('one'),
        Maybe.just('two'),
      ),
      expected: 'one:two',
    }),
  ]),

  describe('Maybe.andThen', [
    assert({
      given: 'nothing',
      should: 'return nothing',
      actual: Maybe.andThen(a => Maybe.just(a), Maybe.nothing()),
      expected: Maybe.nothing(),
    }),
    assert({
      given: 'a value',
      should: 'return just the value',
      actual: Maybe.andThen(a => Maybe.just(a), Maybe.just('value')),
      expected: Maybe.just('value'),
    }),
    assert({
      given: 'a value and a mapping',
      should: 'return just the mapped value',
      actual: Maybe.andThen(
        a => Maybe.just(`mapped:${a}`),
        Maybe.just('value'),
      ),
      expected: Maybe.just('mapped:value'),
    }),
    assert({
      given: 'a chain with a nothing',
      should: 'return nothing',
      actual: Maybe.andThen(
        a =>
          Maybe.andThen(
            b => Maybe.andThen(c => Maybe.nothing(), Maybe.just(b)),
            Maybe.just(a),
          ),
        Maybe.just('value'),
      ),
      expected: Maybe.nothing(),
    }),
    assert({
      given: 'a chain with a value',
      should: 'return just the mapped value',
      actual: Maybe.andThen(
        a =>
          Maybe.andThen(
            b => Maybe.andThen(c => Maybe.just(`mapped:${c}`), Maybe.just(b)),
            Maybe.just(a),
          ),
        Maybe.just('value'),
      ),
      expected: Maybe.just('mapped:value'),
    }),
  ]),

  describe('Maybe.isJust', [
    assert({
      given: 'a value',
      should: 'return true',
      actual: Maybe.isJust(Maybe.just('value')),
      expected: true,
    }),
    assert({
      given: 'nothing',
      should: 'return false',
      actual: Maybe.isJust(Maybe.nothing()),
      expected: false,
    }),
  ]),

  describe('Maybe.isNothing', [
    assert({
      given: 'a value',
      should: 'return false',
      actual: Maybe.isNothing(Maybe.just('value')),
      expected: false,
    }),
    assert({
      given: 'nothing',
      should: 'return true',
      actual: Maybe.isNothing(Maybe.nothing()),
      expected: true,
    }),
  ]),
]);
