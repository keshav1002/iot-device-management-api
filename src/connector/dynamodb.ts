import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

export class DynamoDBConnector {
  private documentClient: DynamoDBDocumentClient

  constructor() {
    let params = {}

    if (process.env.IS_OFFLINE) {
      require('dotenv').config()
      params['region'] = process.env.DYNAMODB_LOCAL_REGION
      params['endpoint'] = process.env.DYNAMODB_LOCAL_ENDPOINT
    }

    const client = new DynamoDBClient(params)
    if (!this.documentClient) this.documentClient = DynamoDBDocumentClient.from(client)
  }

  getClient() {
    return this.documentClient
  }

  getSensorsTableName() {
    if (process.env.IS_OFFLINE) {
      require('dotenv').config()
      return process.env.DYNAMODB_LOCAL_SENSORS_TABLE_NAME
    } else {
      return process.env.SENSORS_TABLE
    }
  }
}
