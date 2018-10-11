import * as colors from 'wool/colors';

const WIDTH = 80;

export default {
  repeat,
  title,
  message,
};

function repeat(char, times) {
  const result = [];
  for (let i = 0; i < times; i++) {
    result.push(char);
  }
  return result.join('');
}

function title(label, location) {
  let spacerCount = WIDTH - label.length - location.length - 4;
  if (spacerCount < 2) spacerCount = 2;

  return colors.red(
    [
      '❖',
      label.toUpperCase(),
      // repeat(' ', (WIDTH - label.length - location.length - 8) / 2),
      // '❖ ❖ ❖',
      // repeat(' ', (WIDTH - label.length - location.length - 8) / 2),
      repeat('-', spacerCount),
      location,
    ].join(' '),
  );
}

function message(string) {
  const wrapped = [];
  const words = string.split(' ');
  let chars = 0;
  words.forEach(word => {
    const normalised = word.replace(/\\u001B\[[0-9]{2}m/g, '');
    chars += normalised.length + 1;
    if (chars < WIDTH) {
      wrapped.push(word);
    } else {
      wrapped.push(`\n${word.replace(' ', '')}`);
      chars = normalised.length + 1;
    }
  });
  return wrapped.join(' ');
}
