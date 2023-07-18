import { APIGatewayEvent } from 'aws-lambda';
import { ZodError, z } from 'zod';
import apiGateWay from '.';
import { HttpError } from './handler';

describe('getEvent', () => {
  const event = {
    body: JSON.stringify({ name: 'John', age: 30 }),
    // other properties...
  } as APIGatewayEvent;

  const schema = z.object({ name: z.string(), age: z.number() });

  it('should parse event body and return parsed data', () => {
    const result = apiGateWay.getEvent(event, schema);
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should throw an error if the body is not valid JSON', () => {
    event.body = 'invalid json';
    expect(() => apiGateWay.getEvent(event, schema)).toThrow('The body is not a valid json');
  });

  it('should throw an error if the parsed data does not match the schema', () => {
    event.body = JSON.stringify({ name: 'John' }); // Missing "age" property
    expect(() => apiGateWay.getEvent(event, schema)).toThrow(ZodError);
  });
});

describe('response', () => {
  it('should return a valid APIGatewayProxyResult with the provided body and statusCode', () => {
    const body = { message: 'Success' };
    const statusCode = 200;
    const result = apiGateWay.response(body, statusCode);
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should return a valid APIGatewayProxyResult with statusCode 200 and empty body if no body is provided', () => {
    const result = apiGateWay.response();
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
    const result = apiGateWay.responseError(error);
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
    const result = apiGateWay.responseError(error);
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
    const result = apiGateWay.responseError(error);
    expect(result).toEqual({
      body: '{"error":{"message":"Generic error","issues":[]}}',
      headers: {
        'Content-Type': 'application/json',
      },
      statusCode: 500,
    });
  });
});
