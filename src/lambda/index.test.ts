import Sentry from '@sentry/serverless';
import lambda from '.';
import { Context } from 'aws-lambda';

jest.mock('@sentry/serverless', () => {
  const originalModule = jest.requireActual('@sentry/serverless');
  return {
    ...originalModule,
    AWSLambda: {
      ...originalModule.AWSLambda,
      init: jest.fn(),
      wrapHandler: jest.fn((handler) => handler),
    },
  };
});

describe('Sentry Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.SENTRY_DNS;
  });

  it('should call Sentry with default settings', async () => {
    process.env.SENTRY_DNS = 'your_identification_key_here';

    const handler = jest.fn(async (event) => {
      return { statusCode: 200, body: 'Success' };
    });

    const wrappedHandler = lambda().handler(handler);

    const event = { someKey: 'someValue' };
    const context = {} as Context;
    const callback = jest.fn();

    await wrappedHandler(event, context, callback);

    expect(handler).toHaveBeenCalledWith(event, context, callback);
    expect(Sentry.AWSLambda.init).toHaveBeenCalledWith({
      dsn: process.env.SENTRY_DNS,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV || 'development',
    });
    expect(Sentry.AWSLambda.wrapHandler).toHaveBeenCalledWith(handler, undefined);
  });

  it('should call Sentry with custom settings', async () => {
    const customOptions = {
      tracesSampleRate: 0.5,
      environment: 'production',
    };

    process.env.SENTRY_DNS = 'your_identification_key_here';

    const handler = jest.fn(async (event) => {
      return { statusCode: 200, body: 'Success' };
    });

    const wrappedHandler = lambda(customOptions).handler(handler);

    const event = { someKey: 'someValue' };
    const context = {} as Context;
    const callback = jest.fn();

    await wrappedHandler(event, context, callback);

    expect(handler).toHaveBeenCalledWith(event, context, callback);
    expect(Sentry.AWSLambda.init).toHaveBeenCalledWith({
      dsn: process.env.SENTRY_DNS,
      tracesSampleRate: customOptions.tracesSampleRate,
      environment: customOptions.environment,
    });
    expect(Sentry.AWSLambda.wrapHandler).toHaveBeenCalledWith(handler, undefined);
  });

  it('should not call Sentry when the environment variable is not defined', async () => {
    const handler = jest.fn(async (event) => {
      return { statusCode: 200, body: 'Success' };
    });

    const wrappedHandler = lambda().handler(handler);

    const event = { someKey: 'someValue' };
    const context = {} as Context;
    const callback = jest.fn();

    await wrappedHandler(event, context, callback);

    expect(handler).toHaveBeenCalledWith(event, context, callback);
    expect(Sentry.AWSLambda.init).not.toHaveBeenCalled();
    expect(Sentry.AWSLambda.wrapHandler).not.toHaveBeenCalled();
  });
});
