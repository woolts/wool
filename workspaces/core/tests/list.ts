import { List } from 'wool/core';
import { assert, describe, attempt } from 'wool/test';

export default describe('List', [
  describe('List.map', [
    assert({
      given: 'an empty list',
      should: 'return an empty list',
      actual: List.map(a => a, []),
      expect: [],
    }),
    assert({
      given: 'a list of numbers and a squarer',
      should: 'square all those numbers',
      actual: List.map(a => a * a, [1, 2, 3]),
      expect: [1, 4, 9],
    }),
  ]),

  describe('List.indexedMap', [
    assert({
      given: 'an empty list',
      should: 'return an empty list',
      actual: List.indexedMap((a, i) => i, []),
      expect: [],
    }),
    assert({
      given: 'a list of numbers an index picker',
      should: 'return the indices',
      actual: List.indexedMap((a, i) => i, [1, 2, 3]),
      expect: [0, 1, 2],
    }),
  ]),

  describe('List.foldl', [
    assert({
      given: 'an empty list',
      should: 'return an empty list',
      actual: List.foldl((cur, prev) => [...prev, cur], [], []),
      expect: [],
    }),
    assert({
      given: 'a list of numbers and an adder',
      should: 'sum the numbers',
      actual: List.foldl((cur, prev) => prev + cur, 0, [1, 2, 3]),
      expect: 6,
    }),
    assert({
      given: 'a list of numbers a concat',
      should: 'reverse the list',
      actual: List.foldl((cur, prev) => [...prev, cur], [], [1, 2, 3]),
      expect: [3, 2, 1],
    }),
  ]),

  describe('List.foldr', [
    assert({
      given: 'an empty list',
      should: 'return an empty list',
      actual: List.foldr((cur, prev) => [...prev, cur], [], []),
      expect: [],
    }),
    assert({
      given: 'a list of numbers and an adder',
      should: 'sum the numbers',
      actual: List.foldr((cur, prev) => prev + cur, 0, [1, 2, 3]),
      expect: 6,
    }),
    assert({
      given: 'a list of numbers a concat',
      should: 'maintain the order',
      actual: List.foldr((cur, prev) => [...prev, cur], [], [1, 2, 3]),
      expect: [1, 2, 3],
    }),
  ]),

  describe('List.filter', [
    assert({
      given: 'an empty list',
      should: 'return an empty list',
      actual: List.filter(a => a % 2 === 0, [], []),
      expect: [],
    }),
    assert({
      given: 'a list of numbers an evens filter',
      should: 'return list of even numbers',
      actual: List.filter(a => a % 2 === 0, [1, 2, 3, 4]),
      expect: [2, 4],
    }),
  ]),
]);
