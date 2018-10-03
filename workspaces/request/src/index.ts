import * as http from 'http';

interface RequestOptions {
  json?: boolean;
}

interface Response {
  statusCode: number;
  body: string | object;
}

const defaultOptions: RequestOptions = {
  json: false,
};

export default function request(
  url,
  options: RequestOptions = defaultOptions,
): Promise<Response> {
  const httpOptions = {
    headers: {},
  };

  if (options.json) {
    httpOptions.headers['Content-Type'] = 'application/json';
  }

  return new Promise((resolve, reject) => {
    try {
      http
        .get(url, httpOptions, res => {
          let data = '';

          res.on('data', chunk => {
            data += chunk;
          });

          res.on('end', () => {
            let body = data;
            if (options.json) {
              try {
                body = JSON.parse(data);
              } catch {
                body = data;
              }
            }

            resolve({
              statusCode: res.statusCode,
              body,
            });
          });
        })
        .on('error', err => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
}
