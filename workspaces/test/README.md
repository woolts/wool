# Wool / Test

A testing library for [wool](https://github.com/woolts/wool).

## Philosophy

As [Eric Elliot discusses](https://medium.com/javascript-scene/rethinking-unit-test-assertions-55f59358253f), a testing library only requires a single assertion: equality.

_expand_

### Fuzz Testing

Fuzz tests let us run far more assertions than it would be reasonable to write by hand.

We can use the in-built fuzzers, or create our own, and still follow the philosophy of only asserting equality.

## Getting Started

```
wool add wool/test
```

## Examples

```ts
import { String } from 'wool/core';
import { assert, describe, fuzz } from 'wool/test';

describe('The String module', [
  describe('String.reverse', [
    assert({
      given: 'a palindrome',
      should: 'have no effect',
      actual: String.reverse('hannah'),
      expect: 'hannah'
    }),

    assert({
      given: 'a known string',
      should: 'reverse',
      actual: String.reverse('abcdefg'),
      expect: 'gfedcba'
    }),

    fuzz({
      given: fuzz.string(),
      should: 'restores the original string if you run it again',
      actual: pipe(
        String.reverse,
        String.reverse
      ),
      expect: fuzz.given()
    })
  ])
]);
```
