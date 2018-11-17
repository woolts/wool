# Wool / Test

A testing library for [wool](https://github.com/woolts/wool).

## Philosophy

As [Eric Elliot discusses](https://medium.com/javascript-scene/rethinking-unit-test-assertions-55f59358253f), a testing library only requires a single assertion: equality.

Usually, it is also only worthwhile testing the public API of a package. So we add the package under test as a dependency of our test suite.

### Fuzz Testing

Fuzz tests let us run far more assertions than it would be reasonable to write by hand.

We can use the in-built fuzzers, or create our own, and still follow the philosophy of only asserting equality.

## Getting Started

If you have the workspace `workspaces/example`, structured as:

```
workspaces/example/
  src/
    index.ts
  wool.json
```

Add a tests workspace:

```
workspaces/example/
  src/
    index.ts
    wool.json
  tests/
    all.ts
    wool.json
  wool.json
```

And these `wool.json` configs:

```json
// workspaces/example/wool.json
{
  "private": true,
  "workspaces": [
    "src",
    "tests"
  ],
  "tasks": {
    "test": ["wool", "run-private", "[namespace]/example-tests"]
  }
}
```

```json
// workspaces/example/src/wool.json
{
  "name": "[namespace]/example",
  "entry": "index.ts",
  "dependencies": {}
}
```

```json
// workspaces/example/tests/wool.json
{
  "private": true,
  "name": "[namespace]/example-tests",
  "entry": "all.ts",
  "dependencies": {
    "[namespace]/example": "0.0.0 <= v < 1.0.0"
  }
}
```

Then add `wool/test` to your tests suite.

```
wool add -w workspaces/example/tests wool/test
```

Now, run your tests with:

```
wool task workspaces/example test
```

The output is in the [TAP format](https://testanything.org), and can be styled with any of [these reporters](https://github.com/sindresorhus/awesome-tap#reporters).

Typically you would structure your test suite like this:

```ts
import run, { describe } from 'wool/test';

import maybeSuite from './maybe';
import stringSuite from './string';

run(describe('example', [maybeSuite, stringSuite]));
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
