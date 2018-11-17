type List<A> = Array<A>;

// singleton
// repeat
// range
// cons

const map = <A, B>(fn: (a: A) => B, as: List<A>): List<B> => as.map(a => fn(a));

const indexedMap = <A, B>(fn: (a: A, i: number) => B, as: List<A>): List<B> =>
  as.map(fn);

const foldl = <A, B>(fn: (char: A, b: B) => B, b: B, as: List<A>): B =>
  reverse(as).reduce((previous, current) => fn(current, previous), b);

const foldr = <A, B>(fn: (char: A, b: B) => B, b: B, as: List<A>): B =>
  as.reduce((previous, current) => fn(current, previous), b);

const filter = <A>(fn: (a: A) => Boolean, as: List<A>): List<A> =>
  as.filter(a => fn(a));

// filterMap

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
// append
// concat
// concatMap
// intersperse
// map2
// sort
// sortBy
// sortWith
// isEmpty
// head
// tail
// take
// drop
// partition
// unzip

export default {
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
};
