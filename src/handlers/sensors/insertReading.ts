import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { Readings } from 'readings'

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
    const body = getBodyFromEvent(event)

    if (!body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid payload' }),
        headers: {
          'content-type': 'application/json',
        },
      }
    }

    const ttl = body.TTL
    const skValue = new Date(ttl * 1000).toISOString()

    let updateItem = {
      PK: `DEVICE#${deviceId}`,
      SK: `READING#${skValue}`,
      Temp: body.Temp,
      TTL: body.TTL,
    }

    if (body.ErrorStatus) {
      updateItem['ErrorStatus'] = body.ErrorStatus
    }

    const command = new PutCommand({
      TableName: sensorsTable,
      Item: updateItem,
    })

    await docClient.send(command)

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId,
      }),
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

const getBodyFromEvent = (event: APIGatewayProxyEvent): Readings.Reading | undefined => {
  if (!event.body) {
    return undefined
  }
  try {
    if (event.isBase64Encoded === true) {
      return JSON.parse(Buffer.from(event.body, 'base64').toString()) as Readings.Reading
    } else {
      return JSON.parse(event.body) as Readings.Reading
    }
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const handler = main
