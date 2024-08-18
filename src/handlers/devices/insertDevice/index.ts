import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { insertDevice } from '../../../controllers/devices'
import { getDeviceBodyFromEvent } from '../../../shared/parser'
import { errorResponse, response } from '../../../shared/responses'

const main: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    const body = getDeviceBodyFromEvent(event)

    if (!body) {
      return errorResponse('Invalid payload', 400)
    }

    const { deviceId } = await insertDevice(body)

    return response({ deviceId }, 201)
  } catch (error) {
    return errorResponse((error as Error).message)
  }
}

export const handler = main
