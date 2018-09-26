import { exec } from 'wool/process';

export default function request(url) {
  // TODO: security issue
  return exec(`curl ${url}`).then(result => JSON.parse(result));
}
