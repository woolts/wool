export type Version = string;

export const PATCH = 0;
export const MINOR = 1;
export const MAJOR = 2;

// Semver
export function fromNPM(npmConstraint) {}

export function toNPM(constraint) {}

export function toConstraint(min, max) {
  return `${min} <= v < ${max}`;
}

export function toSafeConstraintFromVersion(version: Version) {
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

export function satisfies(constraint, version: Version) {
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
export function increment(version: Version, level = PATCH) {
  const v = splitVersion(version);

  if (level === MAJOR) {
    return `${v.major + 1}.0.0`;
  }

  if (level === MINOR) {
    return `${v.major}.${v.minor + 1}.0`;
  }

  return `${v.major}.${v.minor}.${v.patch + 1}`;
}

export function splitVersion(version: Version) {
  if (typeof version !== 'string') {
    throw new Error(`Cannot split version as it is not a string: ${version}`);
  }
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

export function findMaxVersion(versions: Array<Version>) {
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

export function compareVersions(version, withVersion) {
  const v = splitVersion(version);
  const w = splitVersion(withVersion);

  if (v.major === w.major && v.minor === w.minor && v.patch === w.patch) {
    return 0;
  }

  return v.major <= w.major && v.minor <= w.minor && v.patch < w.patch ? -1 : 1;
}
