import * as request from 'supertest'

let testApiUrl = 'https://96r4s7t64i.execute-api.ap-southeast-1.amazonaws.com'
let stage = 'dev'

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
