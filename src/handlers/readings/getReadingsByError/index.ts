import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getReadingsByError } from '../../../controllers/readings'
import { errorResponse, response } from '../../../shared/responses'

const main: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    if (!event?.pathParameters?.status) {
      return errorResponse('Invalid payload', 400)
    }
    const errorStatus = event.pathParameters.status

    const items = await getReadingsByError({ ErrorStatus: errorStatus })

    return response({ readings: items }, 200)
  } catch (error) {
    return errorResponse((error as Error).message)
  }
}

export const handler = main
