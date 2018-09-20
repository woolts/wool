import run from 'wool/cli-args';

// import add from './commands/add';
import list from './commands/list';
// import local from './commands/local';
import make from './commands/make';
import pack from './commands/pack';
import publish from './commands/publish';
// import version from './commands/version';

const app = {
  name: 'wool',
  version: '0.0.0',
  commands: [
    // add,
    list,
    // local,
    make,
    pack,
    publish,
    // version,
  ],
};

run(app, process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
