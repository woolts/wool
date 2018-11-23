import action from './task';

export default {
  name: 'task',
  action,
  alias: 't',
  args: '<nameOrDir> <name>',
  options: [
    {
      name: 'children',
      type: 'boolean',
      alias: 'c',
      description: 'Run the task for all children.',
      default: false,
    },
  ],
};
