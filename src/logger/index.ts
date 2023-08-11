import pino, { Logger } from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

let instance: Logger | undefined = undefined;

function isEnabled() {
  const logEnabled = process.env.LOG_ENABLED || 'ON';

  if (logEnabled === 'ON' || logEnabled === '1') return true;

  if (logEnabled === 'OFF' || logEnabled === '0') return false;
}

function logger(): Logger<pino.LoggerOptions> {
  const logConfig: pino.LoggerOptions = {
    enabled: isEnabled(),
    level: process.env.LOG_LEVEL || 'debug',
    base: null,
    timestamp: false,
    transport: isDevelopment ? { target: 'pino-pretty' } : undefined,
  };

  if (instance) return instance;

  instance = pino(logConfig);

  return instance;
}

export default logger;
