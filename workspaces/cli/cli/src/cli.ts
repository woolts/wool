import runCli from 'wool/cli-args';

import add from './commands/add';
import dependencies from './commands/dependencies';
import init from './commands/init';
import list from './commands/list';
// import local from './commands/local';
import make from './commands/make';
import pack from './commands/pack';
import preflight from './commands/preflight';
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
    dependencies,
    init,
    list,
    // local,
    make,
    pack,
    preflight,
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
