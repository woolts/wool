import { List } from 'wool/core';
import { assert, describe } from 'wool/test';

export default describe('List', [
  describe('List.map', [
    assert({
      given: 'an empty list',
      should: 'return an empty list',
      actual: List.map(a => a, []),
      expected: [],
    }),
    assert({
      given: 'a list of numbers and a squarer',
      should: 'square all those numbers',
      actual: List.map(a => a * a, [1, 2, 3]),
      expected: [1, 4, 9],
    }),
  ]),

  describe('List.indexedMap', [
    assert({
      given: 'an empty list',
      should: 'return an empty list',
      actual: List.indexedMap((a, i) => i, []),
      expected: [],
    }),
    assert({
      given: 'a list of numbers an index picker',
      should: 'return the indices',
      actual: List.indexedMap((a, i) => i, [1, 2, 3]),
      expected: [0, 1, 2],
    }),
  ]),

  describe('List.foldl', [
    assert({
      given: 'an empty list',
      should: 'return an empty list',
      actual: List.foldl((cur, prev) => [...prev, cur], [], []),
      expected: [],
    }),
    assert({
      given: 'a list of numbers and an adder',
      should: 'sum the numbers',
      actual: List.foldl((cur, prev) => prev + cur, 0, [1, 2, 3]),
      expected: 6,
    }),
    assert({
      given: 'a list of numbers a concat',
      should: 'reverse the list',
      actual: List.foldl((cur, prev) => [...prev, cur], [], [1, 2, 3]),
      expected: [3, 2, 1],
    }),
  ]),

  describe('List.foldr', [
    assert({
      given: 'an empty list',
      should: 'return an empty list',
      actual: List.foldr((cur, prev) => [...prev, cur], [], []),
      expected: [],
    }),
    assert({
      given: 'a list of numbers and an adder',
      should: 'sum the numbers',
      actual: List.foldr((cur, prev) => prev + cur, 0, [1, 2, 3]),
      expected: 6,
    }),
    assert({
      given: 'a list of numbers a concat',
      should: 'maintain the order',
      actual: List.foldr((cur, prev) => [...prev, cur], [], [1, 2, 3]),
      expected: [1, 2, 3],
    }),
  ]),

  describe('List.filter', [
    assert({
      given: 'an empty list',
      should: 'return an empty list',
      actual: List.filter(a => a % 2 === 0, []),
      expected: [],
    }),
    assert({
      given: 'a list of numbers an evens filter',
      should: 'return list of even numbers',
      actual: List.filter(a => a % 2 === 0, [1, 2, 3, 4]),
      expected: [2, 4],
    }),
  ]),

  describe('List.length', [
    assert({
      given: 'an empty list',
      should: 'return 0',
      actual: List.length([]),
      expected: 0,
    }),
    assert({
      given: 'a list with 3 values',
      should: 'return 3',
      actual: List.length(['a', 'b', 'c']),
      expected: 3,
    }),
  ]),

  describe('List.reverse', [
    assert({
      given: 'an empty list',
      should: 'return an empty list',
      actual: List.reverse([]),
      expected: [],
    }),
    assert({
      given: 'a list with values',
      should: 'reverse the list',
      actual: List.reverse([1, 2, 3]),
      expected: [3, 2, 1],
    }),
  ]),

  describe('List.member', [
    assert({
      given: 'an empty list',
      should: 'return false',
      actual: List.member(1, []),
      expected: false,
    }),
    assert({
      given: 'a list with the value',
      should: 'return true',
      actual: List.member(1, [1, 2, 3]),
      expected: true,
    }),
  ]),

  describe('List.all', [
    assert({
      given: 'an empty list',
      should: 'return true',
      actual: List.all(a => a % 2 === 0, []),
      expected: true,
    }),
    assert({
      given: 'a list with some even numbers',
      should: 'return false',
      actual: List.all(a => a % 2 === 0, [1, 2, 3]),
      expected: false,
    }),
    assert({
      given: 'a list with all even numbers',
      should: 'return true',
      actual: List.all(a => a % 2 === 0, [2, 4, 6]),
      expected: true,
    }),
  ]),

  describe('List.any', [
    assert({
      given: 'an empty list',
      should: 'return false',
      actual: List.any(a => a % 2 === 0, []),
      expected: false,
    }),
    assert({
      given: 'a list with some even numbers',
      should: 'return true',
      actual: List.any(a => a % 2 === 0, [1, 2, 3]),
      expected: true,
    }),
    assert({
      given: 'a list with all even numbers',
      should: 'return true',
      actual: List.any(a => a % 2 === 0, [2, 4, 6]),
      expected: true,
    }),
  ]),
]);
