import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { insertDevice } from '../../../controllers/devices'
import { getDeviceBodyFromEvent } from '../../../shared/parser'
import { errorResponse, response } from '../../../shared/responses'
import { logger } from '../../../shared/logger'
import { DynamoDBConnector } from '../../../connector/dynamodb'

logger.appendPersistentKeys({
  serviceName: 'sensors',
  handler: 'insertDevice',
})

const main: APIGatewayProxyHandler = async (event, context): Promise<APIGatewayProxyResult> => {
  logger.addContext(context)
  logger.info('Event', { event, env: process.env })
  try {
    const body = getDeviceBodyFromEvent(event)

    if (!body) {
      return errorResponse('Invalid payload', 400)
    }

    const start = new Date().getTime()

    const dynamoDbConnector = new DynamoDBConnector()
    const { deviceId } = await insertDevice(body, dynamoDbConnector)

    const end = new Date().getTime()
    logger.info('Result', { duration: end - start })

    return response({ deviceId }, 201)
  } catch (error) {
    return errorResponse((error as Error).message)
  }
}

export const handler = main
