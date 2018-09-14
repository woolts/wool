import action from './bundle';

export default {
  name: 'bundle',
  alias: 'b',
  arguments: '[path]',
  options: [
    {
      name: 'version',
      alias: 'v',
    },
  ],
  action,
};
