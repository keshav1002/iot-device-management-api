import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { insertReading } from '../../../controllers/readings'
import { getReadingsBodyFromEvent } from '../../../shared/parser'
import { errorResponse, response } from '../../../shared/responses'
import { logger } from '../../../shared/logger'

logger.appendPersistentKeys({
  serviceName: 'sensors',
  handler: 'insertReading',
})

const main: APIGatewayProxyHandler = async (event, context): Promise<APIGatewayProxyResult> => {
  logger.addContext(context)
  logger.info('Event', { event, env: process.env })
  try {
    if (!event?.pathParameters?.id) {
      return errorResponse('Invalid payload', 400)
    }
    const deviceId = event.pathParameters.id

    const body = getReadingsBodyFromEvent(event)
    if (!body) {
      return errorResponse('Invalid payload', 400)
    }

    const start = new Date().getTime()

    await insertReading({ deviceId }, body)

    const end = new Date().getTime()
    logger.info('Result', { duration: end - start })

    return response({ deviceId, message: 'Reading Added Successfully!' }, 201)
  } catch (error) {
    return errorResponse((error as Error).message)
  }
}

export const handler = main
