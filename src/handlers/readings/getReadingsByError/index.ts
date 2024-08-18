import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getReadingsByError } from '../../../controllers/readings'
import { errorResponse, response } from '../../../shared/responses'
import { logger } from '../../../shared/logger'

logger.appendPersistentKeys({
  serviceName: 'sensors',
  handler: 'getReadingsByError',
})

const main: APIGatewayProxyHandler = async (event, context): Promise<APIGatewayProxyResult> => {
  logger.addContext(context)
  logger.info('Event', { event, env: process.env })
  try {
    if (!event?.pathParameters?.status) {
      return errorResponse('Invalid payload', 400)
    }
    const errorStatus = event.pathParameters.status

    const start = new Date().getTime()

    const items = await getReadingsByError({ ErrorStatus: errorStatus })

    const end = new Date().getTime()
    logger.info('Result', { duration: end - start })

    return response({ readings: items }, 200)
  } catch (error) {
    return errorResponse((error as Error).message)
  }
}

export const handler = main
