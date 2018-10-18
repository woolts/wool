import * as colors from 'wool/colors';
import { padRight } from 'wool/utils';

// TODO: spinners should be on the stderr, used for messaging not output

// https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

let singletonInterval;
let singletonTimeout;

export function startSpinner(
  message: () => string,
  options: { silentUntil?: number } = {},
) {
  let frame = 0;
  let first = false;

  let timeoutWrapper = next => next();

  if (options.silentUntil) {
    timeoutWrapper = next => {
      singletonTimeout = setTimeout(next, options.silentUntil);
    };
  }

  timeoutWrapper(() => {
    singletonInterval = setInterval(() => {
      if (!first) {
        clearLines(1);
      }
      first = false;
      writeLine(`${colors.magenta(frames[frame])} ${message()}`);

      frame++;
      frame = frame % frames.length;
    }, 80);
  });
}

export function stopSpinner(message: () => string) {
  if (singletonTimeout !== undefined) {
    clearTimeout(singletonTimeout);
    return;
  }

  clearLines(1);
  writeLine(message());
  console.log('');
  clearInterval(singletonInterval);
}

export function spinner<X>(
  promise: Promise<X>,
  pendingMessage: () => string,
  completeMessage: (value: X) => string,
) {
  let frame = 0;

  let first = true;
  let complete = false;

  const interval = setInterval(() => {
    if (!first) {
      clearLines(1);
    }
    first = false;
    if (!complete) {
      writeLine(`${colors.magenta(frames[frame])} ${pendingMessage()}`);
    }

    frame++;
    frame = frame % frames.length;
  }, 80);

  promise.then(value => {
    complete = true;
    clearLines(1);
    writeLine(completeMessage(value));
    clearInterval(interval);
  });
}

export function multiSpinner(
  pendings: Array<Promise<any>>,
  toPendingMessage: (index: number) => string,
  toCompleteMessage: (index: number) => string,
) {
  let frame = 0;
  let first = true;

  const completes = [];
  pendings.forEach((pending, index) => {
    pending.then(() => completes.push(index));
  });

  const interval = setInterval(() => {
    if (!first) {
      clearLines(Object.keys(pendings).length);
    }
    first = false;
    pendings.forEach((_, index) => {
      if (completes.includes(index)) {
        writeLine(toCompleteMessage(index));
      } else {
        // TODO: fix this being a shorter line than complete and not overwriting
        // the tail characters
        writeLine(
          `${colors.magenta(frames[frame])} ${toPendingMessage(index)}`,
        );
      }
    });
    frame++;
    frame = frame % frames.length;
  }, 80);

  Promise.all(pendings).then(() => {
    clearLines(Object.keys(pendings).length);
    pendings.forEach((_, index) => {
      writeLine(toCompleteMessage(index));
    });
    clearInterval(interval);
  });
}

function clearLines(count: number) {
  process.stdout.write(`\u001B[${count}A`);
}

function writeLine(str: string, clearTo: number = 80) {
  const str_ = padRight(' ', clearTo, str);
  process.stdout.write(`${str_}\n`);
}
