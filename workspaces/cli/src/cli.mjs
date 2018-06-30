import add from './commands/add';
import help from './commands/help';
// import run from './commands/run';

const commands = { add, help };
const [, , command, ...args] = process.argv;

if (!commands[command]) {
  commands.help();
} else {
  commands[command](...args);
}
