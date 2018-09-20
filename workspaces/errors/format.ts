import * as colors from 'wool/colors';

const WIDTH = 80;

export const repeat = (char, times) => {
  const result = [];
  for (let i = 0; i < times; i++) {
    result.push(char);
  }
  return result.join('');
};

export const title = (label, location) =>
  colors.red(
    [
      '❖',
      label.toUpperCase(),
      // repeat(' ', (WIDTH - label.length - location.length - 8) / 2),
      // '❖ ❖ ❖',
      // repeat(' ', (WIDTH - label.length - location.length - 8) / 2),
      repeat('-', WIDTH - label.length - location.length - 8 || 1),
      location,
    ].join(' '),
  );

export const message = string => {
  const wrapped = [];
  const words = string.split(' ');
  let chars = 0;
  words.forEach(word => {
    const normalised = word.replace(/\\u001B\[[0-9]{2}m/g, '');
    chars += normalised.length;
    if (chars < WIDTH) {
      wrapped.push(word);
    } else {
      wrapped.push(`\n${word.replace(' ', '')}`);
      chars = normalised.length;
    }
  });
  return wrapped.join(' ');
};
