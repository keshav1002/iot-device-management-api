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
      KeyConditionExpression: 'PK = :PK and begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':PK': `DEVICE#${deviceId}`,
        ':prefix': 'READING',
      },
      ScanIndexForward: false, // Descending Order
      Limit: 10,
    })

    const result = await docClient.send(command)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sensors: result.Items }),
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
