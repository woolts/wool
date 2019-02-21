// TODO: consider lifting this from lodash (with credit)
export default function isEqual(actual, expected) {
  if (actual === expected) return true;
  if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();
  }
  if (
    actual == null ||
    expected == null ||
    (typeof actual !== 'object' && typeof expected !== 'object')
  ) {
    return actual !== actual && expected !== expected;
  }

  // TODO: improve
  if (Array.isArray(actual) && Array.isArray(expected)) {
    return isEqualArrays(actual, expected);
  }

  if (typeof actual !== typeof actual) return false;
  if (expected instanceof Error && !(actual instanceof Error)) return false;
  if (actual instanceof Error && !(expected instanceof Error)) return false;

  if (expected instanceof Map) {
    if (!(actual instanceof Map)) return false;
    // TODO: improve
    return JSON.stringify([...expected]) === JSON.stringify([...actual]);
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

function isEqualArrays(actual, expected) {
  if (actual.length === 0 && expected.length === 0) return true;
  if (actual.length !== expected.length) return false;

  for (const i in actual) {
    if (!isEqual(actual[i], expected[i])) return false;
  }

  return true;
}
