import { DynamoDBStreamEvent, EventBridgeEvent } from 'aws-lambda';

import { z } from 'zod';
import { DynamoDBRecord } from 'aws-lambda/trigger/dynamodb-stream';

const BaseSchema = z
  .object({
    version: z.string(),
    id: z.string(),
    'detail-type': z.string(),
    source: z.string(),
    account: z.string(),
    time: z.string(),
    region: z.string(),
    resources: z.array(z.unknown()),
    detail: z.object({}),
  })
  .strip();

// eslint-disable-next-line @typescript-eslint/ban-types
type SchemaType = z.ZodObject<{}, 'strip', z.ZodTypeAny, {}, {}>;

function Event<TDetailType extends string>(
  event: EventBridgeEvent<TDetailType, any> | DynamoDBStreamEvent,
  source: string,
  detailType: string,
) {
  return {
    dynamodb(): DynamoDBRecord[] {
      return (event as DynamoDBStreamEvent).Records;
    },
    detail(detailSchema?: SchemaType, complete = false) {
      const schema = BaseSchema.extend({
        source: z.literal(source).describe('The source producing the event'),
        'detail-type': z.literal(detailType).describe('The type of event'),
        detail: detailSchema || z.object({}),
      }).strip();

      const data = schema.parse(event);

      return complete ? data : data.detail;
    },
  };
}

export default Event;
