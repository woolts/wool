export const PATCH = 0;
export const MINOR = 1;
export const MAJOR = 2;

// Semver
export function fromNPM(npmConstraint) {}

export function toNPM(constraint) {}

export function toConstraint(min, max) {
  return `${min} <= v < ${max}`;
}

export function toSafeConstraintFromVersion(version) {
  const { major, minor, patch } = splitVersion(version);
  return toConstraint(
    joinVersion(major, minor, patch),
    joinVersion(major + 1, 0, 0),
  );
}

export function fromConstraint(constraint) {
  const min = '0.0.0';
  const max = '999.999.999';
  return { min, max };
}

export function satisfies(constraint, version) {
  const { min, max } = fromConstraint(constraint);

  const v = splitVersion(version);
  const n = splitVersion(min);
  const x = splitVersion(max);

  return (
    v.major >= n.major &&
    v.minor >= n.minor &&
    v.patch >= n.patch &&
    (v.major <= x.major && v.minor <= x.minor && v.patch < x.patch)
  );
}

// Version
export function increment(version, level = PATCH) {}

export function splitVersion(version) {
  const [major, minor, patch] = version.split('.');
  return {
    major: parseInt(major, 10),
    minor: parseInt(minor, 10),
    patch: parseInt(patch, 10),
  };
}

export function joinVersion(major, minor, patch) {
  return `${major}.${minor}.${patch}`;
}

export function findMaxVersion(versions) {
  const splits = versions.map(splitVersion);
  let max = { major: 0, minor: 0, patch: 0 };
  splits.forEach(({ major, minor, patch }) => {
    if (
      major > max.major ||
      (major === max.major && minor > max.minor) ||
      (major === max.major && minor === max.minor && patch > max.patch)
    ) {
      max = { major, minor, patch };
    }
  });
  return joinVersion(max.major, max.minor, max.patch);
}