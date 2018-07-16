import { rollup } from 'rollup';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

import woolPlugin from './rollup-plugin';

export default async function make({ args, options }) {
  const bundle = await rollup({
    input: args.path,
    output: {
      file: options.output,
      format: 'cjs',
    },
    external: ['child_process', 'fs', 'path', 'readline', 'util'],
    plugins: [
      resolve(),
      commonjs(),
      woolPlugin(),
      terser({ ecma: 8, toplevel: true }),
    ],
  });

  await bundle.write({});
}
