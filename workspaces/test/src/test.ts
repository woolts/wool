export interface Suite {
  label: string;
  assertions: Array<Suite> | Array<Assertion>;
}

export interface Assertion {
  given: string;
  should: string;
  actual: Function;
  expect: any;
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

function runSuite(suite: Suite, parents?: Array<string>) {
  if (suite.assertions.length === 0) return;
  if ((<Suite>suite.assertions[0]).assertions) {
    (<Array<Suite>>suite.assertions).forEach((assertion: Suite) => {
      runSuite(assertion, parents ? [...parents, suite.label] : [suite.label]);
    });
  } else {
    console.log(
      `# ${parents ? `${parents.join(' > ')} > ` : ''}${suite.label}`,
    );
    (<Array<Assertion>>suite.assertions).forEach((assertion: Assertion) => {
      runAssertion(assertion);
    });
  }
}

function runAssertion(assertion: Assertion) {
  assertionCount += 1;

  const result = assertion.actual === assertion.expect;

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
  }
}

export default function run(suite: Suite) {
  console.log('TAP version 13');

  assertionCount = 0;

  runSuite(suite);

  console.log(`1..${assertionCount}`);
}
