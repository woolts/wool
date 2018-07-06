import action from './add';

export default {
  name: 'add',
  action,
  alias: 'a',
  arguments: '<name>',
  options: [
    {
      name: 'global',
      alias: 'g',
      description: "Add the package's binaries to your global path",
    },
  ],
  examples: [
    [
      'wool add alice/package',
      'Install alice/package into your wool packages and add it to your project dependencies',
    ],
    [
      'wool add alice/cli --global',
      'Install alice/cli into your wool packages and add its binaries to your path',
    ],
    [
      'wool add .',
      'Install the project in the current directory into your wool packages',
    ],
  ],
};
