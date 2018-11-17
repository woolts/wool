import { Opaque } from './opaque';

export type Nothing = Opaque<'Nothing', null>;
export type Just<A> = Opaque<'Just', A>;

export type Maybe<A> = Just<A> | Nothing;

const withDefault = <A>(fallback: A, maybe: Maybe<A>): A =>
  isNothing(maybe) ? fallback : maybe;

const just = <A>(a: A) => a as Just<A>;
const nothing = () => null as Nothing;

const map = <A, B>(fn: (a: A) => B, maybe: Maybe<A>): Maybe<B> =>
  isNothing(maybe) ? nothing() : just(fn(maybe));

const map2 = <A, B, C>(
  fn: (a: A, b: B) => C,
  maybeA: Maybe<A>,
  maybeB: Maybe<B>,
): Maybe<C> =>
  isNothing(maybeA) || isNothing(maybeB) ? nothing() : just(fn(maybeA, maybeB));

const andThen = <A, B>(fn: (a: A) => Maybe<B>, maybeA: Maybe<A>): Maybe<B> =>
  isNothing(maybeA) ? nothing() : fn(maybeA);

const isJust = <A>(maybe: Maybe<A>): maybe is Just<A> => maybe != null;
const isNothing = <A>(maybe: Maybe<A>): maybe is Nothing => maybe == null;

export default {
  withDefault,
  just,
  nothing,
  map,
  map2,
  andThen,
  isJust,
  isNothing,
};
