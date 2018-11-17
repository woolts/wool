import run, { describe } from 'wool/test';

import maybe from './maybe';
import string from './string';

run(describe('core', [maybe, string]));
