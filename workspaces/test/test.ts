import { List, String } from 'wool/core';

import isEqual from './is-equal';

export { isEqual };

export interface Suite {
  label: string;
  children: Array<Suite> | Array<Assertion>;
}

export interface Assertion {
  given: string;
  should: string;
  actual: any;
  expected: any;
}

export default async function run(suite: Suite) {
  console.log('TAP version 13');

  assertionCount = 0;

  await runSuite(suite);

  console.log(`1..${assertionCount}`);
}

export function describe(
  label: string,
  children: Array<Suite> | Array<Assertion>,
) {
  return { label, children };
}

let assertionCount = 0;

export function assert(assertion: Assertion) {
  return assertion;
}

export function attempt(fn: Function) {
  return async () => {
    try {
      return await fn();
    } catch (err) {
      return err;
    }
  };
}

async function runSuite(suite: Suite, parents?: Array<string>) {
  if (suite.children.length === 0) return;
  if ((<Suite>suite.children[0]).children) {
    await (<Array<Suite>>suite.children).reduce(
      (promise, child: Suite) =>
        promise.then(() =>
          runSuite(child, parents ? [...parents, suite.label] : [suite.label]),
        ),
      Promise.resolve(),
    );
  } else {
    console.log(
      `# ${parents ? `${String.join(' ↠ ', parents)} ↠ ` : ''}${suite.label}`,
    );
    await (<Array<Assertion>>suite.children).reduce(
      (promise, assertion: Assertion) =>
        promise.then(() => runAssertion(assertion)),
      Promise.resolve(),
    );
  }
}

async function runAssertion(assertion: Assertion) {
  assertionCount += 1;

  let actual;
  if (typeof assertion.actual === 'function') {
    try {
      actual = await assertion.actual();
    } catch (err) {
      actual = err;
    }
  } else {
    actual = await assertion.actual;
  }

  const result = isEqual(actual, assertion.expected);

  if (result) {
    console.log(
      `ok ${assertionCount} GIVEN ${assertion.given} SHOULD ${
        assertion.should
      }`,
    );
  } else {
    console.log(
      `not ok ${assertionCount} GIVEN ${assertion.given} SHOULD ${
        assertion.should
      }`,
    );
    console.log('  ---');
    // if (typeof actual === 'object' && typeof assertion.expected === 'object') {
    //   logObjectDiff(actual, assertion.expected);
    // } else {
    if (assertion.expected instanceof Map) {
      console.log(`  expected: ${JSON.stringify([...assertion.expected])}`);
    } else {
      console.log(`  expected: ${JSON.stringify(assertion.expected)}`);
    }

    if (actual instanceof Error) {
      console.log(`  received: Error – ${actual.message}`);
    } else if (actual instanceof Map) {
      console.log(`  received: ${JSON.stringify([...actual])}`);
    } else {
      console.log(`  received: ${JSON.stringify(actual)}`);
    }
    // }
    console.log('  ...');
  }
}

function logObjectDiff(actual, expected) {
  const missing = List.sort(
    List.difference(Object.keys(expected), Object.keys(actual)),
  );
  const extra = List.sort(
    List.difference(Object.keys(actual), Object.keys(expected)),
  );
  const values = List.filter(
    key => actual[key] !== expected[key],
    Object.keys(expected),
  );

  if (
    List.length(missing) === 0 &&
    List.length(extra) === 0 &&
    List.length(values) === 0
  ) {
    return;
  }

  console.log(
    `  expected: {${String.join(
      ', ',
      List.map(key => `${key}: ${expected[key]}`, values),
    )}}`,
  );
  console.log(
    `  received: {${String.join(
      ', ',
      List.map(key => `${key}: ${actual[key]}`, values),
    )}}`,
  );

  // console.log(List.foldr(String.append, '', missing));
  // console.log(List.foldr(String.append, '', extra));
  // console.log(List.foldr(String.append, '', List.map((v) => extra)));
}
