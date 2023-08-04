import pino, { Logger } from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

let instance: Logger | undefined = undefined;

function logger(redact?: string[]): Logger<pino.LoggerOptions> {
  const logConfig: pino.LoggerOptions = {
    level: 'debug',
    base: null,
    timestamp: false,
    transport: isDevelopment ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
    redact,
  };

  if (instance) return instance;

  instance = pino(logConfig);

  return instance;
}

export default logger;
