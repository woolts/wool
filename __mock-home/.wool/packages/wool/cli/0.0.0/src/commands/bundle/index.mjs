import action from './bundle.mjs';

export default {
  name: 'bundle',
  aliases: ['b'],
  arguments: '[path]',
  options: [
    {
      name: 'version',
      aliases: 'v',
    },
  ],
  action,
};
