import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getDeviceByDeviceId } from '../../../controllers/devices'
import { errorResponse, response } from '../../../shared/responses'
import { logger } from '../../../shared/logger'
import { DynamoDBConnector } from '../../../connector/dynamodb'

logger.appendPersistentKeys({
  serviceName: 'sensors',
  handler: 'getDevice',
})

const main: APIGatewayProxyHandler = async (event, context): Promise<APIGatewayProxyResult> => {
  logger.addContext(context)
  logger.info('Event', { event, env: process.env })
  try {
    if (!event?.pathParameters?.id) {
      return errorResponse('Invalid payload', 400)
    }
    const deviceId = event.pathParameters.id

    const start = new Date().getTime()

    const dynamoDbConnector = new DynamoDBConnector()
    const item = await getDeviceByDeviceId({ deviceId }, dynamoDbConnector)

    const end = new Date().getTime()
    logger.info('Result', { duration: end - start })

    return response({ device: item }, 200)
  } catch (error) {
    return errorResponse((error as Error).message)
  }
}

export const handler = main
