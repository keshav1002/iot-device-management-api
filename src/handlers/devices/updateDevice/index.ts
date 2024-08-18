import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { Devices } from 'devices'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const sensorsTable = process.env.IS_OFFLINE
  ? 'iot-device-management-dev-sensors'
  : process.env.SENSORS_TABLE

const createUpdateExpressions = (item: { [key: string]: any }) => {
  const updateExpression: string[] = []
  const expressionAttribute: { [key: string]: any } = {}
  const expressionAttributeNames: { [key: string]: any } = {}
  Object.keys(item).map((key) => {
    const placeholder = `:${key}`
    const alias = `#${key}`
    updateExpression.push(`${alias} = ${placeholder}`)
    expressionAttribute[placeholder] = item[key]
    expressionAttributeNames[alias] = key
  })
  return { updateExpression, expressionAttribute, expressionAttributeNames }
}

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

    const { updateExpression, expressionAttribute, expressionAttributeNames } =
      createUpdateExpressions({
        DeviceName: body.DeviceName,
        DeviceLocation: body.DeviceLocation,
      })

    const command = new UpdateCommand({
      TableName: sensorsTable,
      Key: {
        PK: `DEVICE#${deviceId}`,
        SK: `#DETAILS#${deviceId}`,
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttribute,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
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
