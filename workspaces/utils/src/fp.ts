// These utils are all curried by default and the arguments are ordered for
// proper functional application.

// https://gist.github.com/amir-arad/27adf36e33a06c5d65f19aa4bab272dc

interface CurryFn1<A, X> {
  (): CurryFn1<A, X>;
  (A: A): X;
}

interface CurryFn2<A, B, X> {
  (): CurryFn2<A, B, X>;
  (A: A): CurryFn1<B, X>;
  (A: A, B: B): X;
}

interface CurryFn3<A, B, C, X> {
  (): CurryFn3<A, B, C, X>;
  (A: A): CurryFn2<B, C, X>;
  (A: A, B: B): CurryFn1<C, X>;
  (A: A, B: B, C: C): X;
}

interface CurryFn4<A, B, C, D, X> {
  (): CurryFn4<A, B, C, D, X>;
  (A: A): CurryFn3<B, C, D, X>;
  (A: A, B: B): CurryFn2<C, D, X>;
  (A: A, B: B, C: C): CurryFn1<D, X>;
  (A: A, B: B, C: C, D: D): X;
}

interface CurryFn5<A, B, C, D, E, X> {
  (): CurryFn5<A, B, C, D, E, X>;
  (A: A): CurryFn4<B, C, D, E, X>;
  (A: A, B: B): CurryFn3<C, D, E, X>;
  (A: A, B: B, C: C): CurryFn2<D, E, X>;
  (A: A, B: B, C: C, D: D): CurryFn1<E, X>;
  (A: A, B: B, C: C, D: D, E: E): X;
}

export function curry<A, B, X>(fn: (a: A, b: B) => X): CurryFn2<A, B, X>;
export function curry<A, B, C, X>(
  fn: (a: A, b: B, c: C) => X,
): CurryFn3<A, B, C, X>;
export function curry<A, B, C, D, X>(
  fn: (a: A, b: B, c: C, d: D) => X,
): CurryFn4<A, B, C, D, X>;
export function curry<A, B, C, D, E, X>(
  fn: (a: A, b: B, c: C, d: D, e: E) => X,
): CurryFn5<A, B, C, D, E, X>;
export function curry(fn: Function): Function {
  const numArgs = fn.length;
  if (arguments.length - 1 < numArgs) {
    return curry.bind(null, ...arguments);
  }
  return fn.apply(null, Array.prototype.slice.call(arguments, 1));
}

export const bisect = curry(function bisect<X>(
  predicate: Predicate<X>,
  xs: Array<X> | undefined,
): [Array<X>, Array<X>] {
  const left = [];
  const right = [];
  if (xs === undefined) return [left, right];
  const predicateFn = createPredicate(predicate);
  for (let x of xs) {
    if (predicateFn(x)) {
      left.push(x);
    } else {
      right.push(x);
    }
  }
  return [left, right];
});

export const find = curry(function find<X>(
  predicate: Predicate<X>,
  xs: Array<X> | undefined,
): X | boolean {
  if (xs === undefined) return false;
  const predicateFn = createPredicate(predicate);
  for (let x of xs) {
    if (predicateFn(x)) return x;
  }
  return false;
});

export const findOr = curry(function findOr<X, Y>(
  predicate: Predicate<X>,
  or: Y,
  xs: Array<X> | undefined,
): X | Y {
  if (xs === undefined) return or;
  const predicateFn = createPredicate(predicate);
  for (let x of xs) {
    if (predicateFn(x)) return x;
  }
  return or;
});

export const get = curry((k: string, x: object) => {
  return x[k];
});

export const has = curry((k: string, x: object) => {
  return x[k] !== undefined;
});

export const map = curry(function map<X, Y>(
  iteratee: Iteratee<X, Y>,
  xs: Array<X> | object,
): Array<Y> {
  const iterateeFn = createIteratee(iteratee);
  if (Array.isArray(xs)) return xs.map(iterateeFn);
  if (typeof xs === 'object') return map(iterateeFn, Object.values(xs));
});

export const padLeft = curry((char: string, len: number, str: string) => {
  if (str.length >= len) return str;
  const pad = range(0, len - str.length)
    .map(() => char)
    .join('');
  return pad + str;
});

export const padRight = curry((char: string, len: number, str: string) => {
  if (str.length >= len) return str;
  const pad = range(0, len - str.length)
    .map(() => char)
    .join('');
  return str + pad;
});

export const pick = curry((ks: string | Array<string>, x: object) => {
  const out = {};
  Object.keys(x).forEach(k => {
    if ((typeof ks === 'string' && k === ks) || ks.includes(k)) {
      out[k] = x[k];
    }
  });
  return out;
});

export const range = (from: number, to?: number) => {
  const from_ = to ? from : 0;
  const to_ = to || from;
  return new Array(to_ - from_).fill(0).map((_, i) => i + from);
};

export const some = curry(function some<X>(
  predicate: Function,
  xs: Array<X> | undefined,
): boolean {
  if (xs === undefined) return false;
  const predicateFn = createPredicate(predicate);
  for (let x of xs) {
    if (predicateFn(x)) return true;
  }
  return false;
});

export function unique<X>(xs: Array<X>): Array<X> {
  return xs.filter((x, i) =>
    [...xs.slice(0, i), ...xs.slice(i + 1)].includes(x),
  );
}

export const uniqueBy = curry(function uniqueBy<X, Y>(
  iteratee: Iteratee<X, Y>,
  xs: Array<X>,
): Array<X> {
  const mapped = map(iteratee, xs);
  const duplicateIndices = xs.reduce((acc, _, i) => {
    const isDuplicate = [
      ...mapped.slice(0, i),
      ...mapped.slice(i + 1),
    ].includes(mapped[i]);
    return isDuplicate ? acc.concat(i) : acc;
  }, []);
  return xs.filter((_, i) => !duplicateIndices.includes(i));
});

// --- Predicate ---

type Predicate<X> = PredicateFn<X> | Matches | MatchesProperty | Property;
type PredicateFn<X> = (x: X) => boolean;
type Matches = { [key: string]: any };
type MatchesProperty = [string, any];
type Property = string;

// @private
function createPredicate<X>(predicate: Predicate<X>): (x: X) => boolean {
  if (typeof predicate === 'function') return predicate;

  if (typeof predicate === 'object') {
    return (x: X) => {
      let matches = true;
      Object.keys(predicate).forEach(key => {
        matches = matches && x[key] === predicate[key];
      });
      return matches;
    };
  }

  if (Array.isArray(predicate)) {
    return (x: X) => x[predicate[0]] === predicate[1];
  }

  if (typeof predicate === 'string') {
    return (x: X) => Boolean(x[predicate]);
  }
}

// --- Iteratee ---

type Iteratee<X, Y> = (x: X, index: number) => Y | string;

// @private
function createIteratee<X, Y>(
  iteratee: Iteratee<X, Y>,
): (x: X, index: number) => Y {
  if (typeof iteratee === 'function') {
    return iteratee as (x: X, index: number) => Y;
  }
  if (typeof iteratee === 'string') {
    return (x: X, index: number) => x[iteratee] as Y;
  }
  throw new Error(`Iteratee must be a function or string, given '${iteratee}'`);
}
