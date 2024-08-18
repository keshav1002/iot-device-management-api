import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getDeviceByDeviceId } from '../../../controllers/devices'
import { errorResponse, response } from '../../../shared/responses'

const main: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    if (!event?.pathParameters?.id) {
      return errorResponse('Invalid payload', 400)
    }
    const deviceId = event.pathParameters.id

    const item = await getDeviceByDeviceId({ deviceId })

    return response({ device: item }, 200)
  } catch (error) {
    return errorResponse((error as Error).message)
  }
}

export const handler = main
