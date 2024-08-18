import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

import { Devices } from 'devices'
import { Readings } from 'readings'
import { CONSTANTS } from '../shared/constants'
import { DynamoDBConnector } from '../connector/dynamodb'

export const getLatestDeviceReadingsByDeviceId = async (
  params: Devices.DeviceId,
  dynamoDbConnector: DynamoDBConnector,
): Promise<Devices.Device[]> => {
  const { deviceId } = params

  const command = new QueryCommand({
    TableName: dynamoDbConnector.getSensorsTableName(),
    KeyConditionExpression: `${CONSTANTS.PARTITION_KEY} = :${CONSTANTS.PARTITION_KEY} and begins_with(${CONSTANTS.SORT_KEY}, :prefix)`,
    ExpressionAttributeValues: {
      [`:${CONSTANTS.PARTITION_KEY}`]: `${CONSTANTS.PK_PREFIX}${CONSTANTS.KEY_DELIM}${deviceId}`,
      ':prefix': `${CONSTANTS.SK_READING_PREFIX}`,
    },
    ScanIndexForward: false, // Descending Order
    Limit: 10,
  })

  const result = await dynamoDbConnector.getClient().send(command)

  return result.Items as Devices.Device[]
}

export const getReadingsByError = async (
  params: Readings.ErrorStatus,
  dynamoDbConnector: DynamoDBConnector,
): Promise<Readings.Reading[]> => {
  const { ErrorStatus } = params

  const command = new QueryCommand({
    TableName: dynamoDbConnector.getSensorsTableName(),
    IndexName: `${CONSTANTS.GSI_READINGS_BY_ERROR}`,
    KeyConditionExpression: `#${CONSTANTS.GSI_RE_PK} = :${CONSTANTS.GSI_RE_PK}`,
    ExpressionAttributeNames: {
      [`#${CONSTANTS.GSI_RE_PK}`]: `${CONSTANTS.GSI_RE_PK}`,
    },
    ExpressionAttributeValues: {
      [`:${CONSTANTS.GSI_RE_PK}`]: ErrorStatus,
    },
  })

  const result = await dynamoDbConnector.getClient().send(command)

  return result.Items as Readings.Reading[]
}

export const insertReading = async (
  device: Devices.DeviceId,
  reading: Readings.Reading,
  dynamoDbConnector: DynamoDBConnector,
): Promise<Devices.DeviceId> => {
  const { deviceId } = device
  const { TTL, Temp, ErrorStatus } = reading

  const ttl = TTL
  const skValue = new Date(ttl * 1000).toISOString()

  let updateItem = {
    PK: `${CONSTANTS.PK_PREFIX}${CONSTANTS.KEY_DELIM}${deviceId}`,
    SK: `${CONSTANTS.SK_READING_PREFIX}${CONSTANTS.KEY_DELIM}${skValue}`,
    Temp: Temp,
    TTL: TTL,
  }

  if (ErrorStatus) {
    updateItem['ErrorStatus'] = ErrorStatus
  }

  const command = new PutCommand({
    TableName: dynamoDbConnector.getSensorsTableName(),
    Item: updateItem,
  })

  await dynamoDbConnector.getClient().send(command)

  return {
    deviceId,
  }
}
