import runCli from 'wool/cli-args';

import add from './commands/add';
import init from './commands/init';
import list from './commands/list';
// import local from './commands/local';
import make from './commands/make';
import pack from './commands/pack';
import runPrivate from './commands/run-private';
import publish from './commands/publish';
import run from './commands/run';
import summary from './commands/summary';
import task from './commands/task';
// import version from './commands/version';

const app = {
  name: 'wool',
  version: '0.0.0',
  commands: [
    add,
    init,
    list,
    // local,
    make,
    pack,
    publish,
    run,
    runPrivate,
    summary,
    task,
    // version,
  ],
};

runCli(app, process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
