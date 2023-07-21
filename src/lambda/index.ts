// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sentry = require('@sentry/serverless');
import { Context } from 'aws-lambda';

function Lambda(options?: any) {
  if (process.env.SENTRY_DNS) {
    Sentry.AWSLambda.init({
      dsn: process.env.SENTRY_DNS,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV || 'development',
      ...options,
    });
  }

  return {
    handler(callback: (event: any, context: Context) => void | Promise<any>) {
      return process.env.SENTRY_DNS ? Sentry.AWSLambda.wrapHandler(callback) : callback;
    },
  };
}

export default Lambda;
