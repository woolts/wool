import action from './list.mjs';

export default {
  name: 'list',
  alias: 'ls',
  options: [
    {
      name: 'global',
      alias: 'g',
      type: 'boolean',
    },
  ],
  action,
};
