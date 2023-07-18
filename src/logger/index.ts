import { APIGatewayEventRequestContext } from 'aws-lambda';
import pino, { Logger } from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

function logger(
  context?: APIGatewayEventRequestContext,
  prefix?: string,
  redact?: string[],
): Logger<pino.LoggerOptions> {
  let logConfig: pino.LoggerOptions = {
    level: 'debug',
    base: null,
    timestamp: false,
    msgPrefix: prefix ? `${prefix} ` : undefined,
    transport: isDevelopment ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
  };

  if (redact && redact.length > 0) {
    logConfig = {
      ...logConfig,
      redact,
    };
  }

  const loggerInstance = pino(logConfig);

  if (context) {
    const customChild = {} as any;

    if (context.requestId) {
      customChild['aws-request-id'] = context.requestId;
    }

    return loggerInstance.child(customChild);
  }

  return loggerInstance;
}

export default logger;
