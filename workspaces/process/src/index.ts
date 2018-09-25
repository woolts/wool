import * as child_process from 'child_process';
import * as util from 'util';
import * as colors from 'wool/colors';

export const exec = (command: string) => {
  if (process.argv.includes('--wool-debug')) {
    console.log(colors.gray('exec ::'), colors.gray(command));
  }
  return util
    .promisify(child_process.exec)(command)
    .then(({ stdout, stderr }) => {
      if (stderr) throw new Error(stderr);
      return stdout;
    });
};

export const spawn = (command: string, args?: Array<string>, options?: any) => {
  if (process.argv.includes('--wool-debug')) {
    console.log(
      colors.gray('spawn ::'),
      colors.gray(command),
      colors.gray(args),
    );
  }
  const withDefaults = { stdio: 'inherit', ...options };
  return util.promisify(child_process.spawn)(command, args, withDefaults);
};
