import { WoolError, format } from 'wool/messages';
import { Tuple } from './tuple';

export type List<A> = Array<A>;

const error = (fn, msg) => {
  return new WoolError({
    location: `List.${fn}`,
    message: msg,
  });
};

// --- Create ---

// singleton
// repeat
// range
const cons = <A>(a: List<A>, b: List<A>): List<A> => [...a, ...b];

// --- Transform ---

const map = <A, B>(fn: (a: A) => B, as: List<A>): List<B> => as.map(a => fn(a));

const indexedMap = <A, B>(fn: (a: A, i: number) => B, as: List<A>): List<B> =>
  as.map(fn);

const foldl = <A, B>(fn: (a: A, b: B) => B, b: B, as: List<A>): B =>
  reverse(as).reduce((previous, current) => fn(current, previous), b);

const foldr = <A, B>(fn: (a: A, b: B) => B, b: B, as: List<A>): B =>
  as.reduce((previous, current) => fn(current, previous), b);

const filter = <A>(fn: (a: A) => Boolean, as: List<A>): List<A> => {
  if (!as.filter) throw error('filter', 'expected an array');
  return as.filter(a => fn(a));
};

// filterMap

// --- Utilities ---

const length = <A>(as: List<A>): number => as.length;

const reverse = <A>(as: List<A>): List<A> => as.reverse();

const member = <A>(a: A, as: List<A>): Boolean => as.includes(a);

const all = <A>(fn: (a: A) => Boolean, as: List<A>): Boolean => {
  for (const i of as) {
    if (!fn(i)) return false;
  }
  return true;
};

const any = <A>(fn: (a: A) => Boolean, as: List<A>): Boolean => {
  for (const i of as) {
    if (fn(i)) return true;
  }
  return false;
};

// maximum
// minimum
// sum
// product

// --- Combine ---

// append
// concat
// concatMap
// intersperse
// map2

// --- Sort ---

const sort = <A>(as: List<A>): List<A> => {
  return as.sort();
};

// sortBy
// sortWith

// --- Deconstruct ---

// isEmpty
// head
// tail
// take

const difference = <A>(left: List<A>, right: List<A>): List<A> => {
  const [diff] = partition(a => member(a, right), left);
  return diff;
};

// drop

const partition = <A>(
  fn: (a: A) => Boolean,
  as: List<A>,
): Tuple<List<A>, List<A>> => {
  const left = [];
  const right = [];
  as.forEach(a => {
    if (fn(a)) {
      left.push(a);
    } else {
      right.push(a);
    }
  });
  return [left, right];
};

// unzip

export default {
  cons,
  map,
  indexedMap,
  foldl,
  foldr,
  filter,
  length,
  reverse,
  member,
  all,
  any,
  sort,
  difference,
  partition,
};
