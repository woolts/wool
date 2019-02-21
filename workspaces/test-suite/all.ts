import run, { describe } from 'wool/test';

import core from './core/all';
import pkg from './package/all';
import terminal from './terminal/all';
import test from './test/all';

run(describe('all', [core, pkg, terminal, test]));
