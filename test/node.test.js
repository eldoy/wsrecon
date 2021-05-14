/**
* @jest-environment node
*/

const socket = require('../index.js')

describe('socket', () => {
  beforeEach(async () => {
    await new Promise(r => setTimeout(r, 1000))
  })

  it('should send and receive data', async (done) => {
    const s = await socket('ws://localhost:6000')
    s.on('message', function(data) {
      expect(data.value).toBe('hello')
      done()
    })
    s.send({ value: 'hello' })
  })

  it('should reconnect automatically', async (done) => {
    const s = await socket('ws://localhost:6000', { timeout: 10 })
    s.close(4000)
    await new Promise(r => setTimeout(r, 100))
    s.send({ hello: 'infinity' })
    s.on('message', function(data) {
      expect(data.hello).toBe('infinity')
      done()
    })
  })
})
