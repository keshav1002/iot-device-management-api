import { DynamoDBConnector } from '../../src/connector/dynamodb'
import { deleteDevice, insertDevice } from '../../src/controllers/devices'
import {
  getLatestDeviceReadingsByDeviceId,
  getReadingsByError,
  insertReading,
} from '../../src/controllers/readings'

const DynamoDbConnector = new DynamoDBConnector(true)
let newDeviceId = ''

beforeAll(async () => {
  const { deviceId } = await insertDevice(
    {
      DeviceLocation: 'Test Device Location',
      DeviceName: 'Test Device',
    },
    DynamoDbConnector,
  )
  newDeviceId = deviceId
})

afterAll(async () => {
  await deleteDevice(
    {
      deviceId: newDeviceId,
    },
    DynamoDbConnector,
  )
  newDeviceId = ''
})

describe('Test if readings logic works correctly', () => {
  it('should get readings by error', async () => {
    const response = await getReadingsByError(
      {
        ErrorStatus: 'High',
      },
      DynamoDbConnector,
    )
    expect(response[0].ErrorStatus).toEqual('High')
  })

  it('should insert readings', async () => {
    const response = await insertReading(
      {
        deviceId: newDeviceId,
      },
      {
        Temp: 40,
        TTL: new Date().getSeconds() / 1000,
      },
      DynamoDbConnector,
    )
    expect(response.deviceId).toEqual(newDeviceId)
  })

  it('should get latest readings by device ID', async () => {
    const response = await getLatestDeviceReadingsByDeviceId(
      {
        deviceId: newDeviceId,
      },
      DynamoDbConnector,
    )
    expect(response).toBeTruthy()
  })
})
