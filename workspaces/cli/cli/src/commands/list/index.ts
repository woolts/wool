import action from './list';

export default {
  name: 'list',
  alias: 'ls',
  options: [
    {
      name: 'global',
      alias: 'g',
      type: 'boolean',
    },
    {
      name: 'registry',
      alias: 'r',
      type: 'string',
    },
  ],
  action,
};
