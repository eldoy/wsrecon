/**
* @jest-environment node
*/

const socket = require('../index.js')

describe('socket', () => {
  beforeEach(async () => {
    await new Promise(r => setTimeout(r, 1000))
  })

  it('should send data', async (done) => {
    const s = await socket('ws://localhost:6000')
    s.on('message', function(data) {
      expect(data.value).toBe('hello')
      done()
    })
    s.send({ value: 'hello' })
  })

  it('should fetch data', async () => {
    const s = await socket('ws://localhost:6000')
    const data = await s.fetch({ value: 'hello' })
    expect(data.value).toBe('hello')
    expect(data.$cbid).toBeUndefined()
  })

  it('should reconnect automatically', async () => {
    const s = await socket('ws://localhost:6000', { reconnect: 1 })
    s.disconnect(4000)
    await new Promise(r => setTimeout(r, 100))
    const data = await s.fetch({ hello: 'infinity' })
    expect(data.hello).toBe('infinity')
  })
})
