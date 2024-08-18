import { CreateTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

const client = new DynamoDBClient({
  region: process.env.DYNAMODB_LOCAL_REGION,
  endpoint: process.env.DYNAMODB_LOCAL_ENDPOINT,
})

const main = async () => {
  const command = new CreateTableCommand({
    TableName: process.env.DYNAMODB_LOCAL_SENSORS_TABLE_NAME,
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      {
        AttributeName: 'PK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'SK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'ErrorStatus',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'PK',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'SK',
        KeyType: 'RANGE',
      },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ReadingsByError',
        KeySchema: [
          {
            AttributeName: 'ErrorStatus',
            KeyType: 'HASH',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
      },
    ],
    LocalSecondaryIndexes: [
      {
        IndexName: 'ErrorsByDevice',
        KeySchema: [
          {
            AttributeName: 'PK',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'ErrorStatus',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
      },
    ],
  })

  const response = await client.send(command)
  console.log(response)
  return response
}

await main()
