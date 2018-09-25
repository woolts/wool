import action from './pack';

export default {
  name: 'pack',
  args: '[dir]',
  options: [
    {
      name: 'version',
      alias: 'v',
    },
  ],
  action,
};
