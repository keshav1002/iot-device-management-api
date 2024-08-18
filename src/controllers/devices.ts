import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { randomUUID } from 'crypto'

import { Devices } from 'devices'
import { createUpdateExpressions } from '../shared/util'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const sensorsTable = process.env.IS_OFFLINE
  ? 'iot-device-management-dev-sensors'
  : process.env.SENSORS_TABLE

export const getDeviceByDeviceId = async (params: Devices.DeviceId): Promise<Devices.Device[]> => {
  const { deviceId } = params

  const command = new QueryCommand({
    TableName: sensorsTable,
    KeyConditionExpression: '#PK = :PK',
    ExpressionAttributeNames: {
      '#PK': 'PK',
    },
    ExpressionAttributeValues: {
      ':PK': `DEVICE#${deviceId}`,
    },
    ScanIndexForward: false,
  })

  const result = await docClient.send(command)

  return result.Items as Devices.Device[]
}

export const insertDevice = async (device: Devices.Device): Promise<Devices.DeviceId> => {
  const { DeviceLocation, DeviceName } = device

  const deviceId = randomUUID()

  const command = new PutCommand({
    TableName: sensorsTable,
    Item: {
      PK: `DEVICE#${deviceId}`,
      SK: `#DETAILS#${deviceId}`,
      DeviceId: deviceId,
      DeviceName,
      DeviceLocation,
    },
  })

  await docClient.send(command)

  return {
    deviceId,
  }
}

export const updateDevice = async (device: Devices.Device): Promise<Devices.DeviceId> => {
  const { DeviceId, DeviceLocation, DeviceName } = device

  const { updateExpression, expressionAttribute, expressionAttributeNames } =
    createUpdateExpressions({
      DeviceName: DeviceName,
      DeviceLocation: DeviceLocation,
    })

  const command = new UpdateCommand({
    TableName: sensorsTable,
    Key: {
      PK: `DEVICE#${DeviceId}`,
      SK: `#DETAILS#${DeviceId}`,
    },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeValues: expressionAttribute,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: 'ALL_NEW',
  })

  await docClient.send(command)

  return {
    deviceId: DeviceId,
  }
}

export const deleteDevice = async (params: Devices.DeviceId): Promise<Devices.DeviceId> => {
  const { deviceId } = params

  const command = new DeleteCommand({
    TableName: sensorsTable,
    Key: {
      PK: `DEVICE#${deviceId}`,
      SK: `#DETAILS#${deviceId}`,
    },
  })

  await docClient.send(command)

  return { deviceId }
}

export const getErrorsByDevice = async (params: Devices.DeviceId): Promise<Devices.Device[]> => {
  const { deviceId } = params

  const command = new QueryCommand({
    TableName: sensorsTable,
    IndexName: 'ErrorsByDevice',
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: {
      ':PK': `DEVICE#${deviceId}`,
    },
  })

  const result = await docClient.send(command)

  return result.Items as Devices.Device[]
}
