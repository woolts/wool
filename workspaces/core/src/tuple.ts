export type Tuple<A, B> = [A, B];

// --- Create ---

const pair = <A, B>(a: A, b: B) => [a, b] as Tuple<A, B>;

// --- Access ---

const first = <A, B>(tuple: Tuple<A, B>): A => tuple[0];

const second = <A, B>(tuple: Tuple<A, B>): B => tuple[1];

// --- Map ---

const mapFirst = <A, B, C>(fn: (a: A) => C, tuple: Tuple<A, B>): C =>
  fn(first(tuple));

const mapSecond = <A, B, C>(fn: (b: B) => C, tuple: Tuple<A, B>): C =>
  fn(second(tuple));

const mapBoth = <A, B, C, D>(
  fnA: (a: A) => C,
  fnB: (b: B) => D,
  tuple: Tuple<A, B>,
): Tuple<C, D> => pair(fnA(first(tuple)), fnB(second(tuple)));

// ---

export default { pair, first, second, mapFirst, mapSecond, mapBoth };
