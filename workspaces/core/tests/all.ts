import run, { describe } from 'wool/test';

import list from './list';
import maybe from './maybe';
import string from './string';

run(describe('core', [list, maybe, string]));
