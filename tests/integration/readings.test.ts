import * as request from 'supertest'

require('dotenv').config()

let testApiUrl = process.env.INTEGRATION_TEST_BASE_URL
let stage = process.env.INTEGRATION_TEST_STAGE

describe('Test if readings integration works correctly', () => {
  it('should return 200 status code with readings when searching by ErrorStatus', async () => {
    const errorStatus = 'High'
    await request(`${testApiUrl}/${stage}`)
      .get(`/sensors/errors/${errorStatus}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeTruthy()
      })
  })
})
