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
      `# ${parents ? `${parents.join(' > ')} > ` : ''}${suite.label}`,
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
    actual = await assertion.actual();
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
    console.log(`  expected: ${JSON.stringify(assertion.expected)}`);
    console.log(`  received: ${JSON.stringify(actual)}`);
    console.log('  ...');
  }
}

// TODO: consider lifting this from lodash (with credit)
function isEqual(actual, expected) {
  if (actual === expected) return true;
  if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();
  }
  if (
    !actual ||
    !expected ||
    (typeof actual !== 'object' && typeof expected !== 'object')
  ) {
    return actual !== actual && expected !== expected;
  }

  // TODO: improve
  if (Array.isArray(actual) && Array.isArray(expected)) {
    for (const i in actual) {
      if (actual[i] !== expected[i]) return false;
    }
    return true;
  }

  if (typeof actual !== typeof actual) return false;
  if (expected instanceof Error && !(actual instanceof Error)) return false;
  if (actual instanceof Error && !(expected instanceof Error)) return false;

  if (typeof expected === 'object') {
    if (typeof actual !== 'object') return false;
    if (Object.keys(actual).length !== Object.keys(expected).length) {
      return false;
    }
    for (const k in expected) {
      if (!isEqual(actual[k], expected[k])) {
        console.log(`'${k}' does not match`);
        return false;
      }
    }
    return true;
  }
}
