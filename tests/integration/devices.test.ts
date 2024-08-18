import * as request from 'supertest'

require('dotenv').config()

let testApiUrl = process.env.INTEGRATION_TEST_BASE_URL
let stage = process.env.INTEGRATION_TEST_STAGE

describe('Test if device CRUD integration works correctly', () => {
  let testDeviceId = ''

  it('should return 201 status code with device ID when new device is inserted', async () => {
    await request(`${testApiUrl}/${stage}`)
      .post('/sensors')
      .send({
        DeviceName: 'Integration Test Device',
        DeviceLocation: 'Integration Test Device Location',
      })
      .expect(201)
      .then((res) => {
        expect(res.body).toBeTruthy()
        testDeviceId = res.body.deviceId
      })
  })

  it('should return 200 status code with device response when device exists', async () => {
    await request(`${testApiUrl}/${stage}`)
      .get(`/sensors/${testDeviceId}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeTruthy()
      })
  })

  it('should return 200 status code when an existing device is updated', async () => {
    await request(`${testApiUrl}/${stage}`)
      .put(`/sensors/${testDeviceId}`)
      .send({
        DeviceName: 'Integration Test Device v2',
        DeviceLocation: 'Integration Test Device Location v2',
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeTruthy()
      })
  })

  it('should return 200 status code when an existing device is deleted', async () => {
    await request(`${testApiUrl}/${stage}`)
      .delete(`/sensors/${testDeviceId}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeTruthy()
      })
  })
})
