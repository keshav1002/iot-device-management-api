import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { updateDevice } from '../../../controllers/devices'
import { getDeviceBodyFromEvent } from '../../../shared/parser'
import { errorResponse, response } from '../../../shared/responses'
import { logger } from '../../../shared/logger'

logger.appendPersistentKeys({
  serviceName: 'sensors',
  handler: 'updateDevice',
})

const main: APIGatewayProxyHandler = async (event, context): Promise<APIGatewayProxyResult> => {
  logger.addContext(context)
  logger.info('Event', { event, env: process.env })
  try {
    if (!event?.pathParameters?.id) {
      return errorResponse('Invalid payload', 400)
    }
    const deviceId = event.pathParameters.id

    const body = getDeviceBodyFromEvent(event)

    if (!body) {
      return errorResponse('Invalid payload', 400)
    }

    const start = new Date().getTime()

    await updateDevice({
      DeviceId: deviceId,
      DeviceLocation: body.DeviceLocation,
      DeviceName: body.DeviceName,
    })

    const end = new Date().getTime()
    logger.info('Result', { duration: end - start })

    return response({ message: 'Device Updated Successfully!' }, 201)
  } catch (error) {
    return errorResponse((error as Error).message)
  }
}

export const handler = main
