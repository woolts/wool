import L, { List } from './list';
import M, { Maybe } from './maybe';
import T, { Tuple } from './tuple';

export type Dict<C, V> = Map<C, V>;

// --- Build ---

const empty = <C, V>(): Dict<C, V> => new Map();

const singleton = <C, V>(comparable: C, value: V) =>
  insert(comparable, value, new Map());

const insert = <C, V>(comparable: C, value: V, dict: Dict<C, V>): Dict<C, V> =>
  dict.set(comparable, value);

const update = <C, V>(
  comparable: C,
  fn: (v: Maybe<V>) => Maybe<V>,
  dict: Dict<C, V>,
): Dict<C, V> =>
  M.withDefault(
    dict,
    M.map(value => insert(comparable, value, dict), fn(get(comparable, dict))),
  );

const remove = <C, V>(comparable: C, dict: Dict<C, V>): Dict<C, V> => {
  dict.delete(comparable);
  return dict;
};

// --- Query ---

const isEmpty = <C, V>(dict: Dict<C, V>) => size(dict) === 0;

const member = <C, V>(comparable: C, dict: Dict<C, V>): boolean =>
  dict.has(comparable);

const get = <C, V>(comparable: C, dict: Dict<C, V>): Maybe<V> => {
  if (member(comparable, dict)) {
    return M.just(dict.get(comparable));
  }
  return M.nothing();
};

const size = <C, V>(dict: Dict<C, V>): number => dict.size;

// --- Lists ---

const keys = <C, V>(dict: Dict<C, V>): List<C> => [...dict.keys()];

const values = <C, V>(dict: Dict<C, V>): List<V> => [...dict.values()];

const toList = <C, V>(dict: Dict<C, V>): List<Tuple<C, V>> => [
  ...dict.entries(),
];

const fromList = <C, V>(list: List<Tuple<C, V>>): Dict<C, V> =>
  L.foldr(
    (tuple: Tuple<C, V>, dict: Dict<C, V>) =>
      insert(T.first(tuple), T.second(tuple), dict),
    empty(),
    list,
  );

// --- Transform ---

const map = <C, A, B>(fn: (k: C, a: A) => B, dict: Dict<C, A>): Dict<C, B> =>
  fromList(
    L.map(
      (tuple: Tuple<C, A>) =>
        T.pair(T.first(tuple), fn(T.first(tuple), T.second(tuple))),
      toList(dict),
    ),
  );

const foldl = <C, A, B>(
  fn: (k: C, v: A, b: B) => B,
  b: B,
  dict: Dict<C, A>,
): B =>
  L.foldl(
    (tuple: Tuple<C, A>, b: B) => fn(T.first(tuple), T.second(tuple), b),
    b,
    toList(dict),
  );

const foldr = <C, A, B>(
  fn: (k: C, v: A, b: B) => B,
  b: B,
  dict: Dict<C, A>,
): B =>
  L.foldr(
    (tuple: Tuple<C, A>, b: B) => fn(T.first(tuple), T.second(tuple), b),
    b,
    toList(dict),
  );

// ---

export default {
  empty,
  singleton,
  insert,
  update,
  remove,
  isEmpty,
  member,
  get,
  size,
  keys,
  values,
  toList,
  fromList,
  map,
  foldl,
  foldr,
  // filter,
  // partition,
  // union,
  // intersect,
  // diff,
  // merge,
};
