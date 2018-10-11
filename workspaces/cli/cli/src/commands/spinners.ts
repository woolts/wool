import * as colors from 'wool/colors';
import { padRight } from 'wool/utils';

// TODO: spinners should be on the stderr, used for messaging not output

export function spinner(promise, pendingMessage, completeMessage) {
  // https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frame = 0;

  let first = true;
  let complete = false;

  const interval = setInterval(() => {
    if (!first) {
      // process.stdout.write(`\u001B[1A`);
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
    // process.stdout.write(`\u001B[1A`);
    clearLines(1);
    writeLine(completeMessage(value));
    clearInterval(interval);
  });
}

export function multiSpinner(pendings, toPendingMessage, toCompleteMessage) {
  // https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frame = 0;
  let first = true;

  const completes = [];
  pendings.forEach((pending, index) => {
    pending.then(() => completes.push(index));
  });

  const interval = setInterval(() => {
    if (!first) {
      // process.stdout.write(`\u001B[${Object.keys(pendings).length}A`);
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
    // process.stdout.write(`\u001B[${Object.keys(pendings).length}A`);
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
