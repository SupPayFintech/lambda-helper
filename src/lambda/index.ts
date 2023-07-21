import Sentry from '@sentry/serverless';
import { WrapperOptions } from '@sentry/serverless/types/awslambda';
import { Handler } from 'aws-lambda';

function lambda(options?: any) {
  if (process.env.SENTRY_DNS) {
    Sentry.AWSLambda.init({
      dsn: process.env.SENTRY_DNS,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV || 'development',
      ...options,
    });
  }

  return {
    handler<TEvent, TResult>(
      handler: Handler<TEvent, TResult>,
      wrapOptions?: Partial<WrapperOptions>,
    ): Handler<TEvent, TResult> {
      return process.env.SENTRY_DNS ? Sentry.AWSLambda.wrapHandler(handler, wrapOptions) : handler;
    },
  };
}

export default lambda;
