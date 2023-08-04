import Sentry from '../Sentry';

export type LambdaConfig = {
  sentry: {
    enabled: boolean;
  };
};

function Lambda(
  config: LambdaConfig = {
    sentry: {
      enabled: false,
    },
  },
) {
  return {
    handler: (callback: any) =>
      config.sentry.enabled ? Sentry(config.sentry).AWSLambda.wrapHandler(callback) : callback,
  };
}

export default Lambda;
