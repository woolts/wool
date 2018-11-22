import run, { describe } from 'wool/test';

import config from './config';
// import preflight from './preflight';
import workspaces from './workspaces';

run(
  describe('core', [
    config,
    // preflight,
    workspaces,
  ]),
);
