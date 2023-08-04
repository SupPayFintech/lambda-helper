import Event from '../index';
import { EventBridgeEvent } from 'aws-lambda';
import { z } from 'zod';

describe('Event function', () => {
  it('should validate correct event object', () => {
    const event: EventBridgeEvent<'CONTROL_ERP.order.check', any> = {
      version: '1',
      id: 'event-id',
      'detail-type': 'CONTROL_ERP.order.check',
      source: 'integrations.controller',
      account: 'account-id',
      time: 'event-time',
      region: 'event-region',
      resources: [],
      detail: {
        foo: 'bar',
      },
    };

    const result = Event(event, 'integrations.controller', 'CONTROL_ERP.order.check').detail(
      z.object({
        foo: z.string(),
      }),
    );

    expect(result).toMatchObject(event.detail);
  });

  it('should validate correct event object full body', () => {
    const event: EventBridgeEvent<'CONTROL_ERP.order.check', any> = {
      version: '1',
      id: 'event-id',
      'detail-type': 'CONTROL_ERP.order.check',
      source: 'integrations.controller',
      account: 'account-id',
      time: 'event-time',
      region: 'event-region',
      resources: [],
      detail: {
        foo: 'bar',
      },
    };
    const detailSchema = z.object({ foo: z.string() });

    const result = Event(event, 'integrations.controller', 'CONTROL_ERP.order.check').detail(detailSchema, true);

    expect(result).toMatchObject(event);
  });

  it('should throw an error for incorrect source', () => {
    const event: EventBridgeEvent<'CONTROL_ERP.order.check', any> = {
      version: '1',
      id: 'event-id',
      'detail-type': 'CONTROL_ERP.order.check',
      source: 'wrong.source',
      account: 'account-id',
      time: 'event-time',
      region: 'event-region',
      resources: [],
      detail: {},
    };

    expect(() => Event(event, 'wrong', 'CONTROL_ERP.order.check').detail()).toThrow();
  });

  it('should throw an error for incorrect detail-type', () => {
    const event: EventBridgeEvent<'WRONG_TYPE', any> = {
      version: '1',
      id: 'event-id',
      'detail-type': 'WRONG_TYPE',
      source: 'integrations.controller',
      account: 'account-id',
      time: 'event-time',
      region: 'event-region',
      resources: [],
      detail: {},
    };

    expect(() => Event(event, 'integrations.controller', 'WRONG').detail()).toThrow();
  });

  it('should throw an error for invalid details', () => {
    const event: EventBridgeEvent<'CONTROL_ERP.order.check', any> = {
      version: '1',
      id: 'event-id',
      'detail-type': 'CONTROL_ERP.order.check',
      source: 'integrations.controller',
      account: 'account-id',
      time: 'event-time',
      region: 'event-region',
      resources: [],
      detail: 'Invalid detail' as any,
    };
    const detailSchema = z.object({ foo: z.string() });

    expect(() => Event(event, 'integrations.controller', 'CONTROL_ERP.order.check').detail(detailSchema)).toThrow();
  });
});
