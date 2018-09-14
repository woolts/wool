import action from './make';

export default {
  name: 'make',
  action,
  alias: 'm',
  arguments: '<dir>',
  options: [
    {
      name: 'output',
      alias: 'o',
      description: 'asdf',
      default: 'wool.js',
    },
  ],
  examples: [
    [
      'wool make .',
      'Compile current directory, if it contains a `wool.json` file',
    ],
    [
      'wool make src',
      'Compile `src` directory, if it contains a `wool.json` file',
    ],
  ],
};
