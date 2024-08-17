import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { Devices } from 'devices'
import { randomUUID } from 'crypto'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const sensorsTable = process.env.IS_OFFLINE
  ? 'iot-device-management-dev-sensors'
  : process.env.SENSORS_TABLE

const main: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
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

    const deviceId = randomUUID()

    const command = new PutCommand({
      TableName: sensorsTable,
      Item: {
        PK: `DEVICE#${deviceId}`,
        SK: `#DETAILS#${deviceId}`,
        DeviceId: deviceId,
        DeviceName: body.DeviceName,
        DeviceLocation: body.DeviceLocation,
      },
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

const getBodyFromEvent = (event: APIGatewayProxyEvent): Devices.Device | undefined => {
  if (!event.body) {
    return undefined
  }
  try {
    if (event.isBase64Encoded === true) {
      return JSON.parse(Buffer.from(event.body, 'base64').toString()) as Devices.Device
    } else {
      return JSON.parse(event.body) as Devices.Device
    }
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const handler = main
