import action from './make';

export default {
  name: 'make',
  action,
  alias: 'm',
  arguments: '<path>',
  options: [
    {
      name: 'output',
      alias: 'o',
      description: 'asdf',
      default: 'wool.js',
    },
  ],
  examples: [
    ['wool make hello.mjs', 'Compile hello.mjs into hello.js'],
    ['wool make hello.mjs --output dist.js', 'Compile hello.mjs into dist.js'],
  ],
};
