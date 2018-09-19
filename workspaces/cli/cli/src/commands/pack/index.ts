import action from './pack';

export default {
  name: 'pack',
  arguments: '[dir]',
  options: [
    {
      name: 'version',
      alias: 'v',
    },
  ],
  action,
};
