export const pipe = (...fns: Array<(value: any) => any>) => value =>
  fns.reduce((result, fn) => fn(result), value);
