import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

import { Devices } from 'devices'
import { Readings } from 'readings'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const sensorsTable = process.env.IS_OFFLINE
  ? 'iot-device-management-dev-sensors'
  : process.env.SENSORS_TABLE

export const getLatestDeviceReadingsByDeviceId = async (
  params: Devices.DeviceId,
): Promise<Devices.Device[]> => {
  const { deviceId } = params

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

  return result.Items as Devices.Device[]
}

export const getReadingsByError = async (
  params: Readings.ErrorStatus,
): Promise<Devices.Device[]> => {
  const { ErrorStatus } = params

  const command = new QueryCommand({
    TableName: sensorsTable,
    IndexName: 'ReadingsByError',
    KeyConditionExpression: '#ErrorStatus = :ErrorStatus',
    ExpressionAttributeNames: {
      '#ErrorStatus': 'ErrorStatus',
    },
    ExpressionAttributeValues: {
      ':ErrorStatus': ErrorStatus,
    },
  })

  const result = await docClient.send(command)

  return result.Items as Devices.Device[]
}

export const insertReading = async (
  device: Devices.DeviceId,
  reading: Readings.Reading,
): Promise<Devices.DeviceId> => {
  const { deviceId } = device
  const { TTL, Temp, ErrorStatus } = reading

  const ttl = TTL
  const skValue = new Date(ttl * 1000).toISOString()

  let updateItem = {
    PK: `DEVICE#${deviceId}`,
    SK: `READING#${skValue}`,
    Temp: Temp,
    TTL: TTL,
  }

  if (ErrorStatus) {
    updateItem['ErrorStatus'] = ErrorStatus
  }

  const command = new PutCommand({
    TableName: sensorsTable,
    Item: updateItem,
  })

  await docClient.send(command)

  return {
    deviceId,
  }
}
