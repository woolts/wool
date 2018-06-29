import alice from 'alice/package';

console.log('lsjroberts/other', '1.0.13');

export default () => {
  console.log('lsjroberts/other', '1.0.13', '--', 'inside');
  alice();
};
