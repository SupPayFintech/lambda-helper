import Sentry from '@sentry/serverless';
import sentryInit from '../index';

jest.mock('@sentry/serverless', () => ({
  AWSLambda: {
    init: jest.fn(),
  },
  Integrations: {
    Http: jest.fn(),
  },
}));

describe('Sentry Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const configs = { enabled: true };
    sentryInit(configs);

    expect(Sentry.AWSLambda.init).toHaveBeenCalledWith({
      dsn: process.env.SENTRY_DNS,
      tracesSampleRate: 0.5,
      environment: process.env.NODE_ENV,
      release: process.env.APP_RELEASE || undefined,
      integrations: [expect.anything()],
      ...configs,
    });
  });

  it('should initialize with custom values', () => {
    const customConfigs = {
      dsn: 'custom_dsn',
      enabled: false,
      customParam: 'value',
    };

    sentryInit(customConfigs);

    expect(Sentry.AWSLambda.init).toHaveBeenCalledWith({
      tracesSampleRate: 0.5,
      environment: process.env.NODE_ENV,
      release: process.env.APP_RELEASE || undefined,
      integrations: [expect.anything()],
      ...customConfigs,
    });
  });
});
