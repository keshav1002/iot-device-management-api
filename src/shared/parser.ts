import { APIGatewayProxyEvent } from 'aws-lambda'
import { Devices } from 'devices'
import { Readings } from 'readings'

export const getDeviceBodyFromEvent = (event: APIGatewayProxyEvent): Devices.Device | undefined => {
  if (!event.body) {
    return undefined
  }
  try {
    if (event.isBase64Encoded === true) {
      return JSON.parse(Buffer.from(event.body, 'base64').toString()) as Devices.Device
    } else {
      return JSON.parse(event.body) as Devices.Device
    }
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const getReadingsBodyFromEvent = (
  event: APIGatewayProxyEvent,
): Readings.Reading | undefined => {
  if (!event.body) {
    return undefined
  }
  try {
    if (event.isBase64Encoded === true) {
      return JSON.parse(Buffer.from(event.body, 'base64').toString()) as Readings.Reading
    } else {
      return JSON.parse(event.body) as Readings.Reading
    }
  } catch (error) {
    console.error(error)
    return undefined
  }
}
