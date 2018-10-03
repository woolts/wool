import * as colors from 'wool/colors';

export function multiSpinner(pendings, toPendingMessage, toCompleteMessage) {
  // https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frame = 0;
  let first = true;

  const completes = [];
  pendings.forEach((pending, index) => {
    pending.then(() => completes.push(index));
  });

  return setInterval(() => {
    if (!first) {
      process.stdout.write(`\u001B[${Object.keys(pendings).length}A`);
    }
    first = false;
    pendings.forEach((pending, index) => {
      if (completes.includes(index)) {
        process.stdout.write(`${toCompleteMessage(index)}\n`);
      } else {
        // TODO: fix this being a shorter line than complete and not overwriting
        // the tail characters
        process.stdout.write(
          `${colors.magenta(frames[frame])} ${toPendingMessage(index)}\n`,
        );
      }
    });
    frame++;
    frame = frame % frames.length;
  }, 80);
}
