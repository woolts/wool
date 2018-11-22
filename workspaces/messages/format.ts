import * as colors from 'wool/colors';
import { map, max, padRight } from 'wool/utils';

const WIDTH = 80;

export default {
  repeat,
  title,
  message,
  table,
};

function repeat(char: string, times: number) {
  const result = [];
  for (let i = 0; i < times; i++) {
    result.push(char);
  }
  return result.join('');
}

function title(label: string, location: string, color = colors.red) {
  let spacerCount = WIDTH - label.length - location.length - 4;
  if (spacerCount < 2) spacerCount = 2;

  return color(
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

function message(string: string) {
  const wrapped = [];
  const words = string.split(' ');
  let chars = 0;
  words.forEach(word => {
    let normalised = JSON.stringify(word).replace(/\\u001B\[[0-9]{2}m/gi, '');
    normalised = normalised.slice(1, normalised.length - 1);
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

/**
 * ```ts
 * table([
 *   ['Hello', 'World'],
 *   ['Bonjour', 'Monde'],
 * ]);
 * ```
 */
function table(rows: Array<Array<string>>) {
  const pad = padRight(' ');

  // TODO: fix map types
  // const out = map(() => [], rows);
  const out = rows.map(() => []);

  rows.forEach((columns, row) => {
    columns.forEach((value, column) => {
      // TODO: fix map types
      // const columnSize = max(map(r => r[column].length, rows));
      const columnSize = max(rows.map(r => r[column].length));
      out[row].push(pad(columnSize, value));
    });
  });

  return map(c => c.join('  '), out).join('\n');
}
