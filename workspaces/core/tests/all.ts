import run, { describe } from 'wool/test';

import dict from './dict';
import list from './list';
import maybe from './maybe';
import string from './string';
// import type from './type';

run(
  describe('core', [
    dict,
    list,
    maybe,
    string,
    // type
  ]),
);
