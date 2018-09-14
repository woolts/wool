import action from './local';

export default {
  name: 'local',
  alias: 'l',
  options: [
    {
      name: 'watch',
      alias: 'w',
      type: 'boolean',
    },
  ],
  action,
};
