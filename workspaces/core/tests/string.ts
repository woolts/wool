import { pipe, String } from 'wool/core';
import { assert, describe } from 'wool/test';

export default describe('String', [
  describe('String.isEmpty', [
    assert({
      given: 'an empty string',
      should: 'return true',
      actual: String.isEmpty(''),
      expect: true,
    }),
    assert({
      given: 'an non-empty string',
      should: 'return false',
      actual: String.isEmpty('hello'),
      expect: false,
    }),
  ]),

  describe('String.length', [
    assert({
      given: 'an empty string',
      should: 'return 0',
      actual: String.length(''),
      expect: 0,
    }),
    assert({
      given: 'an 5-character string',
      should: 'return 5',
      actual: String.length('abcde'),
      expect: 5,
    }),
  ]),

  describe('String.reverse', [
    assert({
      given: 'a palindrome',
      should: 'have no effect',
      actual: String.reverse('hannah'),
      expect: 'hannah',
    }),
    assert({
      given: 'a known string',
      should: 'reverse',
      actual: String.reverse('abcdefg'),
      expect: 'gfedcba',
    }),
    // fuzz({
    //   given: fuzz.string(),
    //   should: 'restores the original string if you run it again',
    //   actual: pipe(
    //     String.reverse,
    //     String.reverse,
    //   ),
    //   expect: fuzz.given(),
    // }),
  ]),

  describe('String.repeat', [
    assert({
      given: '0 times',
      should: 'return an empty string',
      actual: String.repeat(0, 'a'),
      expect: '',
    }),
    assert({
      given: '5 times "a"',
      should: 'return "aaaaa"',
      actual: String.repeat(5, 'a'),
      expect: 'aaaaa',
    }),
    assert({
      given: '3 times "abc"',
      should: 'return "abcabcabc"',
      actual: String.repeat(3, 'abc'),
      expect: 'abcabcabc',
    }),
  ]),
]);
