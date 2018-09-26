import { exec } from 'wool/process';

export default function request(url) {
  // TODO: security issue
  return exec(`curl ${url}`).then(result => {
    // TODO: better error handling
    if (result === '404') {
      return { status: 404 };
    }

    const json = JSON.parse(result);
    json.status = 200;
    return json;
  });
}
