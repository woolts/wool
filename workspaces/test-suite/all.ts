import run, { describe } from 'wool/test';

import core from './core/all';
import pkg from './package/all';
import test from './tests/all';

run(describe('all', [core, pkg, test]));
