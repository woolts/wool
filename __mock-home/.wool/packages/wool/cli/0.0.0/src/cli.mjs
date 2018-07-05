import run from 'wool/cli-args';

import add from './commands/add';
import init from './commands/init';
import help from './commands/help';
import link from './commands/link';
// import run from './commands/run';
import version from './commands/version';

const app = {
  name: 'wool',
  version: '0.0.0',
  commands: [add, version],
};

run(app, process.argv.slice(2)).catch(err => {
  console.error(err.message ? err.message : err);
  process.exitCode = 1;
});
