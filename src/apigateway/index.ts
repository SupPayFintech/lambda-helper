/* eslint-disable no-empty */
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ZodError, z } from 'zod';
import { HttpError } from './handler';

// eslint-disable-next-line @typescript-eslint/ban-types
type SchemaType = z.ZodObject<{}, 'strip', z.ZodTypeAny, {}, {}>;

function getJson(data: string | null) {
  try {
    if (data) return JSON.parse(data);
  } catch (error) {}

  throw new HttpError('The body is not a valid json', 400);
}

function getEvent<T>(event: APIGatewayEvent, schema: SchemaType): T {
  const request = getJson(event.body);

  return schema.parse(request) as T;
}

export type HeadersResponseType =
  | {
      [header: string]: boolean | number | string;
    }
  | undefined;

function baseResponse(body: any, statusCode: number, headers?: HeadersResponseType) {
  return {
    statusCode,
    body: body instanceof Object ? JSON.stringify(body) : '',
    headers: { 'Content-Type': 'application/json', ...headers },
  };
}

function response(body?: any, statusCode = 200, headers?: HeadersResponseType): APIGatewayProxyResult {
  return baseResponse(body, statusCode, headers);
}

function responseError(
  error: Error | HttpError | any,
  statusCode = 500,
  headers?: HeadersResponseType,
): APIGatewayProxyResult {
  if (error instanceof HttpError) {
    return baseResponse(
      {
        error: {
          message: error.message,
          issues: [],
        },
      },
      error.statusCode || statusCode,
      headers,
    );
  }

  if (error instanceof ZodError || !!error.issues) {
    return baseResponse(
      {
        error: {
          message: 'Payload not compatible',
          issues: error.errors,
        },
      },
      400,
      headers,
    );
  }

  return baseResponse(
    {
      error: {
        message: (error as Error).message || 'Fatal error',
        issues: [],
      },
    },
    statusCode,
    headers,
  );
}

export default { getEvent, response, responseError };
