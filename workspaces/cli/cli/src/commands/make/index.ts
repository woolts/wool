import action from './make';

export default {
  name: 'make',
  action,
  alias: 'm',
  args: '<dir>',
  options: [
    {
      name: 'force',
      type: 'boolean',
      alias: 'f',
      description: 'Force all packages to be built, even if no recent changes.',
      default: false,
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
