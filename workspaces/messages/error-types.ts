import format from './format';

class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

interface WoolErrorConfig {
  location: string;
  message: string;
}

export class WoolError extends ExtendableError {
  constructor(config: WoolErrorConfig) {
    const message = [
      format.title('Error', config.location),
      format.message(config.message),
    ].join('\n\n');
    super(message);
  }
}
