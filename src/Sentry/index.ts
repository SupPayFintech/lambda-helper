import Sentry from '@sentry/serverless';

export default (configs: any = {}): any => {
  Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DNS,
    tracesSampleRate: 0.5,
    environment: process.env.NODE_ENV,
    enabled: configs.enabled,
    release: process.env.APP_RELEASE || undefined,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
    ...configs,
  });

  return Sentry;
};
