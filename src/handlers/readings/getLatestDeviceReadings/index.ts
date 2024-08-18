import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getLatestDeviceReadingsByDeviceId } from '../../../controllers/readings'
import { errorResponse, response } from '../../../shared/responses'

const main: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    if (!event?.pathParameters?.id) {
      return errorResponse('Invalid payload', 400)
    }
    const deviceId = event.pathParameters.id

    const items = await getLatestDeviceReadingsByDeviceId({ deviceId })

    return response({ readings: items }, 200)
  } catch (error) {
    return errorResponse((error as Error).message)
  }
}

export const handler = main
