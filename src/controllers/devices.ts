import { DeleteCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'

import { Devices } from 'devices'
import { CONSTANTS } from '../shared/constants'
import { createUpdateExpressions } from '../shared/util'
import { DynamoDBConnector } from '../connector/dynamodb'

export const getDeviceByDeviceId = async (
  params: Devices.DeviceId,
  dynamoDbConnector: DynamoDBConnector,
): Promise<Devices.Device[]> => {
  const { deviceId } = params

  const command = new QueryCommand({
    TableName: dynamoDbConnector.getSensorsTableName(),
    KeyConditionExpression: `#${CONSTANTS.PARTITION_KEY} = :${CONSTANTS.PARTITION_KEY}`,
    ExpressionAttributeNames: {
      [`#${CONSTANTS.PARTITION_KEY}`]: `${CONSTANTS.PARTITION_KEY}`,
    },
    ExpressionAttributeValues: {
      [`:${CONSTANTS.PARTITION_KEY}`]: `${CONSTANTS.PK_PREFIX}${CONSTANTS.KEY_DELIM}${deviceId}`,
    },
    ScanIndexForward: false,
  })

  const result = await dynamoDbConnector.getClient().send(command)

  return result.Items as Devices.Device[]
}

export const insertDevice = async (
  device: Devices.Device,
  dynamoDbConnector: DynamoDBConnector,
): Promise<Devices.DeviceId> => {
  const { DeviceLocation, DeviceName } = device

  const deviceId = randomUUID()

  const command = new PutCommand({
    TableName: dynamoDbConnector.getSensorsTableName(),
    Item: {
      [`${CONSTANTS.PARTITION_KEY}`]: `${CONSTANTS.PK_PREFIX}${CONSTANTS.KEY_DELIM}${deviceId}`,
      [`${CONSTANTS.SORT_KEY}`]: `${CONSTANTS.SK_DETAILS_PREFIX}${CONSTANTS.KEY_DELIM}${deviceId}`,
      DeviceId: deviceId,
      DeviceName,
      DeviceLocation,
    },
  })

  await dynamoDbConnector.getClient().send(command)

  return {
    deviceId,
  }
}

export const updateDevice = async (
  device: Devices.Device,
  dynamoDbConnector: DynamoDBConnector,
): Promise<Devices.DeviceId> => {
  const { DeviceId, DeviceLocation, DeviceName } = device

  const { updateExpression, expressionAttribute, expressionAttributeNames } =
    createUpdateExpressions({
      DeviceName: DeviceName,
      DeviceLocation: DeviceLocation,
    })

  const command = new UpdateCommand({
    TableName: dynamoDbConnector.getSensorsTableName(),
    Key: {
      [`${CONSTANTS.PARTITION_KEY}`]: `${CONSTANTS.PK_PREFIX}${CONSTANTS.KEY_DELIM}${DeviceId}`,
      [`${CONSTANTS.SORT_KEY}`]: `${CONSTANTS.SK_DETAILS_PREFIX}${CONSTANTS.KEY_DELIM}${DeviceId}`,
    },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeValues: expressionAttribute,
    ExpressionAttributeNames: expressionAttributeNames,
  })

  await dynamoDbConnector.getClient().send(command)

  return {
    deviceId: DeviceId,
  }
}

export const deleteDevice = async (
  params: Devices.DeviceId,
  dynamoDbConnector: DynamoDBConnector,
): Promise<Devices.DeviceId> => {
  const { deviceId } = params

  const command = new DeleteCommand({
    TableName: dynamoDbConnector.getSensorsTableName(),
    Key: {
      [`${CONSTANTS.PARTITION_KEY}`]: `${CONSTANTS.PK_PREFIX}${CONSTANTS.KEY_DELIM}${deviceId}`,
      [`${CONSTANTS.SORT_KEY}`]: `${CONSTANTS.SK_DETAILS_PREFIX}${CONSTANTS.KEY_DELIM}${deviceId}`,
    },
  })

  await dynamoDbConnector.getClient().send(command)

  return { deviceId }
}

export const getErrorsByDevice = async (
  params: Devices.DeviceId,
  dynamoDbConnector: DynamoDBConnector,
): Promise<Devices.Device[]> => {
  const { deviceId } = params

  const command = new QueryCommand({
    TableName: dynamoDbConnector.getSensorsTableName(),
    IndexName: `${CONSTANTS.LSI_ERRORS_BY_DEVICE}`,
    KeyConditionExpression: `${CONSTANTS.PARTITION_KEY} = :${CONSTANTS.PARTITION_KEY}`,
    ExpressionAttributeValues: {
      [`:${CONSTANTS.PARTITION_KEY}`]: `${CONSTANTS.PK_PREFIX}${CONSTANTS.KEY_DELIM}${deviceId}`,
    },
  })

  const result = await dynamoDbConnector.getClient().send(command)

  return result.Items as Devices.Device[]
}
