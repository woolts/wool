import List from './list';
import Maybe, { Maybe as MaybeType } from './maybe';

const isEmpty = (str: string): Boolean => length(str) === 0;

const length = (str: string): number => str.length;

const reverse = (str: string): string => fromList(List.reverse(toList(str)));

const repeat = (n: number, chunk: string): string => repeatHelp(n, chunk, '');

const repeatHelp = (n: number, chunk: string, result: string): string => {
  if (n <= 0) return result;
  return repeatHelp(n - 1, chunk, result + chunk);
};

const replace = (before: string, after: string, str: string): string =>
  join(after, split(before, str));

const append = (left: string, right: string): string => `${left}${right}`;

// TODO: this is a duplicate
const concat = (strs: Array<string>): string => fromList(strs);

const split = (sep: string, str: string): Array<string> => str.split(sep);

const join = (sep: string, chunks: Array<string>): string => chunks.join(sep);

// TODO: also `\t` and `\n`
const words = (str: string): Array<string> => split(' ', str);

const lines = (str: string): Array<string> => split('\n', str);

const slice = (start: number, end: number, str: string): string =>
  str.slice(start, end);

const left = (n: number, str: string): string => slice(0, n, str);

const right = (n: number, str: string): string => slice(0, -n, str);

const dropLeft = (n: number, str: string): string => slice(n, length(str), str);

const dropRight = (n: number, str: string): string => slice(0, n, str);

const contains = (search: string, str: string): Boolean => str.includes(search);

const startsWith = (search: string, str: string): Boolean =>
  str.startsWith(search);

const endsWith = (search: string, str: string): Boolean => str.endsWith(search);

// const indexes = (search: string, str: string): Array<number> =>
// const indices = indexes;

const toInt = (str: string): MaybeType<number> => {
  const int = parseInt(str, 10);
  if (str === `${int}`) return Maybe.just(int);
  return Maybe.nothing();
};

const toFloat = (str: string): MaybeType<number> => {
  const float = parseFloat(str);
  if (str === `${float}`) return Maybe.just(float);
  return Maybe.nothing();
};

const fromNumber = (num: number): string => `${num}`;
const fromInt = fromNumber;
const fromFloat = fromNumber;

const toList = (str: string): Array<string> => split('', str);

const fromList = (strs: Array<string>): string => join('', strs);

const toUpper = (str: string): string => str.toUpperCase();

const toLower = (str: string): string => str.toLowerCase();

const pad = (n: number, char: string, str: string): string => {
  const half = n - length(str) / 2;
  return repeat(
    Math.ceil(half),
    concat([char, str, repeat(Math.floor(half), char)]),
  );
};

const padLeft = (n: number, char: string, str: string): string =>
  repeat(n - length(str), concat([char, str]));

const padRight = (n: number, char: string, str: string): string =>
  concat([str, repeat(n - length(str), char)]);

const trim = (str: string): string => str.trim();

const map = (fn: (a: string) => string, str: string): string =>
  fromList(List.map(fn, toList(str)));

const filter = (fn: (a: string) => Boolean, str: string): string =>
  fromList(List.filter(fn, toList(str)));

const foldl = (
  fn: (char: string, b: string) => string,
  b: string,
  str: string,
): string => List.foldl(fn, b, toList(str));

const foldr = (
  fn: (char: string, b: string) => string,
  b: string,
  str: string,
): string => List.foldr(fn, b, toList(str));

const all = (fn: (char: string) => Boolean, str: string): Boolean =>
  List.all(fn, toList(str));

const any = (fn: (char: string) => Boolean, str: string): Boolean =>
  List.any(fn, toList(str));

export default {
  isEmpty,
  length,
  reverse,
  repeat,
  replace,
  append,
  concat,
  split,
  join,
  words,
  lines,
  slice,
  left,
  right,
  dropLeft,
  dropRight,
  contains,
  startsWith,
  endsWith,
  toInt,
  toFloat,
  fromNumber,
  fromInt,
  fromFloat,
  toList,
  fromList,
  toUpper,
  toLower,
  pad,
  padLeft,
  padRight,
  trim,
  map,
  filter,
  foldl,
  foldr,
  all,
  any,
};
