import run from 'wool/cli-args';

import add from './commands/add';
import bundle from './commands/bundle';
import local from './commands/local';
import version from './commands/version';

const app = {
  name: 'wool',
  version: '0.0.0',
  commands: [add, bundle, local, version],
};

run(app, process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
