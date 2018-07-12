import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

import wool from './build/wool-plugin';

export default {
  input: 'workspaces/cli/cli/src/cli.mjs',
  output: {
    file: 'dist/wool.js',
    format: 'cjs',
  },
  external: ['child_process', 'fs', 'path', 'readline', 'util'],
  plugins: [resolve(), commonjs(), wool()],
};
