import * as http from 'http';
import * as fs from 'fs';

interface RequestOptions {
  json?: boolean;
}

interface Response {
  statusCode: number;
  body: any;
}

const defaultOptions: RequestOptions = {
  json: false,
};

export function request(
  url,
  options: RequestOptions = defaultOptions,
): Promise<Response> {
  const httpOptions = {
    headers: {},
  };

  if (options.json) {
    httpOptions.headers['Content-Type'] = 'application/json';
  }

  const requestPromise: Promise<Response> = new Promise((resolve, reject) => {
    try {
      http
        .get(url, httpOptions, res => requestGet(options, resolve, res)) // TODO: add partial() util
        .on('error', err => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });

  if (process.argv.includes('--wool-debug-slow-network')) {
    return requestPromise.then((res: Response) =>
      new Promise(resolve => setTimeout(resolve, 1000)).then(() => res),
    );
  }

  return requestPromise;
}

function requestGet(options, resolve, res) {
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
}

export function download(url: URL, dest: URL) {
  const file = fs.createWriteStream(dest);

  const requestPromise: Promise<Response> = new Promise((resolve, reject) => {
    try {
      http
        .get(url, res => {
          res.pipe(file).on('finish', () => {
            resolve();
          });
        })
        .on('error', err => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });

  if (process.argv.includes('--wool-debug-slow-network')) {
    return requestPromise.then((res: Response) =>
      new Promise(resolve => setTimeout(resolve, 1000)).then(() => res),
    );
  }

  return requestPromise;
}
