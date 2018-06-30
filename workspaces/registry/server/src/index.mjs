import { createServer } from 'http';

import * as packages from './packages';

createServer((req, res) => {
  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {});

  req.on('err', err => {
    console.error(err);
  });
}).listen(8080, async () => {
  await packages.refresh('default');

  console.log('Serving wool/registry-server');
  console.log('');
  console.log('    localhost:8080');
  console.log(`    ${packages.count()} packages`);
  console.log('');
});
