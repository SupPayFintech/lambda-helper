import { APIGatewayEvent } from 'aws-lambda';
import { ZodError, z } from 'zod';
import ApiGateWay from '../index';
import { HttpError } from '../handler';

describe('body', () => {
  const event = {
    body: JSON.stringify({ name: 'John', age: 30 }),
  } as APIGatewayEvent;

  const schema = z.object({ name: z.string(), age: z.number() });

  it('should parse event body and return parsed data', () => {
    const result = ApiGateWay.params(event).body(schema);
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should throw an error if the body is not valid JSON', () => {
    event.body = 'invalid json';
    expect(() => ApiGateWay.params(event).body(schema)).toThrow('The body is not a valid json');
  });

  it('should throw an error if the parsed data does not match the schema', () => {
    event.body = JSON.stringify({ name: 'John' }); // Missing "age" property
    expect(() => ApiGateWay.params(event).body(schema)).toThrow(ZodError);
  });
});

describe('response', () => {
  it('should return a valid APIGatewayProxyResult with the provided body and statusCode', () => {
    const body = { message: 'Success' };
    const statusCode = 200;
    const result = ApiGateWay.response(body, statusCode);
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should return a valid APIGatewayProxyResult with statusCode 200 and empty body if no body is provided', () => {
    const result = ApiGateWay.response();
    expect(result).toEqual({
      statusCode: 200,
      body: '',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });
});

describe('responseError', () => {
  it('should return a valid APIGatewayProxyResult for HttpError', () => {
    const error = new HttpError('Error message', 400);
    const result = ApiGateWay.responseError(error);
    expect(result).toEqual({
      body: '{"error":{"message":"Error message","issues":[]}}',
      headers: {
        'Content-Type': 'application/json',
      },
      statusCode: 400,
    });
  });

  it('should return a valid APIGatewayProxyResult for ZodError', () => {
    const error = new ZodError([]);
    error.addIssue({
      code: z.ZodIssueCode.custom,
      path: [],
      message: 'Example messa',
    });
    const result = ApiGateWay.responseError(error);
    expect(result).toEqual({
      body: '{"error":{"message":"Payload not compatible","issues":[{"code":"custom","path":[],"message":"Example messa"}]}}',
      headers: {
        'Content-Type': 'application/json',
      },
      statusCode: 400,
    });
  });

  it('should return a valid APIGatewayProxyResult for generic Error', () => {
    const error = new Error('Generic error');
    const result = ApiGateWay.responseError(error);
    expect(result).toEqual({
      body: '{"error":{"message":"Generic error","issues":[]}}',
      headers: {
        'Content-Type': 'application/json',
      },
      statusCode: 500,
    });
  });
});

describe('pathParams', () => {
  const event = {
    pathParameters: { userId: '123' },
  } as unknown as APIGatewayEvent;

  const schema = z.object({ userId: z.string() });

  it('should parse event pathParameters and return parsed data', () => {
    const result = ApiGateWay.params(event).pathParams(schema);
    expect(result).toEqual({ userId: '123' });
  });

  it('should throw an error if the parsed data does not match the schema', () => {
    event.pathParameters = { userId: 123 } as any; // "userId" should be string
    expect(() => ApiGateWay.params(event).pathParams(schema)).toThrow(ZodError);
  });
});

describe('queryParams', () => {
  const event = {
    queryStringParameters: { page: '1', limit: '10' },
  } as unknown as APIGatewayEvent;

  const schema = z.object({ page: z.string(), limit: z.string() });

  it('should parse event queryStringParameters and return parsed data', () => {
    const result = ApiGateWay.params(event).queryParams(schema);
    expect(result).toEqual({ page: '1', limit: '10' });
  });

  it('should throw an error if the parsed data does not match the schema', () => {
    event.queryStringParameters = { page: 1, limit: '10' } as any; // "page" should be string
    expect(() => ApiGateWay.params(event).queryParams(schema)).toThrow(ZodError);
  });
});

describe('headers', () => {
  const event = {
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
  } as unknown as APIGatewayEvent;

  const schema = z.object({ 'Content-Type': z.string(), Authorization: z.string() });

  it('should parse event headers and return parsed data', () => {
    const result = ApiGateWay.params(event).headers(schema);
    expect(result).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer token' });
  });

  it('should throw an error if the parsed data does not match the schema', () => {
    event.headers = { 'Content-Type': 'application/json' }; // Missing "Authorization" header
    expect(() => ApiGateWay.params(event).headers(schema)).toThrow(ZodError);
  });
});
