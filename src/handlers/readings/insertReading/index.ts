import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { insertReading } from '../../../controllers/readings'
import { getReadingsBodyFromEvent } from '../../../shared/parser'
import { errorResponse, response } from '../../../shared/responses'

const main: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    if (!event?.pathParameters?.id) {
      return errorResponse('Invalid payload', 400)
    }
    const deviceId = event.pathParameters.id

    const body = getReadingsBodyFromEvent(event)
    if (!body) {
      return errorResponse('Invalid payload', 400)
    }

    await insertReading({ deviceId }, body)

    return response({ deviceId, message: 'Reading Added Successfully!' }, 201)
  } catch (error) {
    return errorResponse((error as Error).message)
  }
}

export const handler = main
