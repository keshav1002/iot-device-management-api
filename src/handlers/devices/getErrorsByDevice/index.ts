import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const sensorsTable = process.env.IS_OFFLINE
  ? 'iot-device-management-dev-sensors'
  : process.env.SENSORS_TABLE

const main: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    if (!event?.pathParameters?.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid payload' }),
        headers: {
          'content-type': 'application/json',
        },
      }
    }
    const deviceId = event.pathParameters.id

    const command = new QueryCommand({
      TableName: sensorsTable,
      IndexName: 'ErrorsByDevice',
      KeyConditionExpression: 'PK = :PK',
      ExpressionAttributeValues: {
        ':PK': `DEVICE#${deviceId}`,
      },
    })

    const result = await docClient.send(command)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sensor: result.Items }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
      headers: {
        'content-type': 'application/json',
      },
    }
  }
}

export const handler = main
