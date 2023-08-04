import Lambda from '../index';

const wrapHandlerMock = jest.fn((handler) => handler);
jest.mock('../../Sentry', () => ({
  __esModule: true,
  default: () => ({
    AWSLambda: {
      wrapHandler: wrapHandlerMock,
    },
  }),
}));

describe('Lambda Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should wrap handler with Sentry when enabled', () => {
    const callback = jest.fn();
    const config = {
      sentry: {
        enabled: true,
      },
    };

    const lambda = Lambda(config);
    const wrappedHandler = lambda.handler(callback);

    expect(wrapHandlerMock).toHaveBeenCalledWith(callback);
    expect(wrappedHandler).toBe(callback);
  });

  it('should not wrap handler with Sentry when disabled', () => {
    const callback = jest.fn();
    const config = {
      sentry: {
        enabled: false,
      },
    };

    const lambda = Lambda(config);
    const wrappedHandler = lambda.handler(callback);

    expect(wrapHandlerMock).not.toHaveBeenCalled();
    expect(wrappedHandler).toBe(callback);
  });

  it('should not wrap handler with Sentry when no config provided', () => {
    const callback = jest.fn();

    const lambda = Lambda();
    const wrappedHandler = lambda.handler(callback);

    expect(wrapHandlerMock).not.toHaveBeenCalled();
    expect(wrappedHandler).toBe(callback);
  });
});
