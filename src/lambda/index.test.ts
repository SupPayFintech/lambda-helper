import Lambda from '.';
import * as Sentry from '@sentry/serverless';
jest.mock('@sentry/serverless', () => ({
  AWSLambda: {
    init: jest.fn(),
    wrapHandler: jest.fn((callback) => callback),
  },
}));

describe('Lambda function tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize Sentry and wrap handler when SENTRY_DNS is defined', () => {
    process.env.SENTRY_DNS = 'dummy-dsn';

    Lambda().handler((event: any, context: any) => {
      return;
    });

    expect(Sentry.AWSLambda.init).toHaveBeenCalledWith({
      dsn: 'dummy-dsn',
      tracesSampleRate: 0.1,
      environment: 'test',
    });

    expect(Sentry.AWSLambda.wrapHandler).toHaveBeenCalled();
  });

  it('should not initialize Sentry and return the original handler when SENTRY_DNS is not defined', () => {
    delete process.env.SENTRY_DNS;

    const callback = jest.fn();

    const originalHandler = Lambda().handler(callback);

    expect(Sentry.AWSLambda.init).not.toHaveBeenCalled();

    expect(Sentry.AWSLambda.wrapHandler).not.toHaveBeenCalled();
    expect(originalHandler).toBe(callback);
  });

  it('should allow passing custom options to Sentry init', () => {
    process.env.SENTRY_DNS = 'dummy-dsn';

    const customOptions = {
      tracesSampleRate: 0.5,
      environment: 'testing',
      customAttribute: 'customValue',
    };

    Lambda(customOptions).handler((event: any, context: any) => {
      return;
    });

    expect(Sentry.AWSLambda.init).toHaveBeenCalledWith({
      dsn: 'dummy-dsn',
      tracesSampleRate: 0.5,
      environment: 'testing',
      customAttribute: 'customValue',
    });
  });
});
