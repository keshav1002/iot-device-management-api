import { DynamoDBConnector } from '../../src/connector/dynamodb'
import {
  deleteDevice,
  getDeviceByDeviceId,
  getErrorsByDevice,
  insertDevice,
  updateDevice,
} from '../../src/controllers/devices'

const DynamoDbConnector = new DynamoDBConnector(true)

describe('Test if device CRUD logic works correctly', () => {
  let newDeviceId = ''
  it('should create a new device', async () => {
    const { deviceId } = await insertDevice(
      {
        DeviceName: 'Unit Test Device',
        DeviceLocation: 'Unit Test Device Location',
      },
      DynamoDbConnector,
    )
    newDeviceId = deviceId
    expect(deviceId).toHaveLength(36)
  })

  it('should get device by Device ID', async () => {
    const response = await getDeviceByDeviceId(
      {
        deviceId: newDeviceId,
      },
      DynamoDbConnector,
    )
    expect(response[0].DeviceId).toEqual(newDeviceId)
  })

  it('should update a device', async () => {
    const response = await updateDevice(
      {
        DeviceId: newDeviceId,
        DeviceName: 'Unit Test Device v2',
        DeviceLocation: 'Unit Test Device Location v2',
      },
      DynamoDbConnector,
    )
    expect(response.deviceId).toEqual(newDeviceId)
  })

  it('should get errors by Device', async () => {
    const response = await getErrorsByDevice(
      {
        deviceId: newDeviceId,
      },
      DynamoDbConnector,
    )
    expect(response).toBeTruthy()
  })

  it('should delete a device', async () => {
    const response = await deleteDevice(
      {
        deviceId: newDeviceId,
      },
      DynamoDbConnector,
    )
    expect(response.deviceId).toEqual(newDeviceId)
  })
})
