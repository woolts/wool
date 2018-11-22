export interface Suite {
  label: string;
  assertions: Array<Suite> | Array<Assertion>;
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
  assertions: Array<Suite> | Array<Assertion>,
) {
  return { label, assertions };
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
  if (suite.assertions.length === 0) return;
  if ((<Suite>suite.assertions[0]).assertions) {
    await Promise.all(
      (<Array<Suite>>suite.assertions).map(async (assertion: Suite) => {
        await runSuite(
          assertion,
          parents ? [...parents, suite.label] : [suite.label],
        );
      }),
    );
  } else {
    console.log(
      `# ${parents ? `${parents.join(' > ')} > ` : ''}${suite.label}`,
    );
    await Promise.all(
      (<Array<Assertion>>suite.assertions).map(async (assertion: Assertion) => {
        await runAssertion(assertion);
      }),
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
