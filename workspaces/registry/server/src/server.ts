import { createServer } from 'http';

import * as packages from './packages';

export default (host, port) => {
  return new Promise(resolve => {
    createServer((req, res) => {
      let body = '';

      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', () => {
        console.log('end', { body });

        body = '';

        res.writeHead(200);
        res.end();
      });

      req.on('err', err => {
        console.error(err);
      });
    }).listen(port, async () => {
      await packages.refresh('example');

      console.log('Serving wool/registry-server');
      console.log('');
      console.log(`    ${host}:${port}`);
      console.log(`    ${packages.count()} packages`);
      console.log('');

      resolve();
    });
  });
};
