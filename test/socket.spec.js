const Socket = require('../socket')
let s
let m

beforeEach((done) => {
  if(s) s.disconnect()
  s = new Socket({ url: 'ws://localhost:6000' })
  s.on('open', () => { done() })
  s.on('message', (data) => { m = data })
})

describe('Socket', () => {
  it('should connect to server', (done) => {
    expect(s.readyState).toEqual(1)
    setTimeout(() => {
      expect(m.message).toBeDefined()
      expect(m.message).toEqual('Welcome')
      done()
    }, 10)
  })

  it('should reconnect automatically', (done) => {
    s.options.timeout = 1
    s.disconnect(4000)

    setTimeout(() => {
      s.send({ baner: 'Risse' }, (data) => {
        console.log(data)
        expect(data.baner).toEqual('Risse')
        done()
      })
    }, 50)
  })

  it('should support callbacks', (done) => {
    s.send({ baner: 'Lisse' }, (data) => {
      expect(data.baner).toEqual('Lisse')
      expect(data['$__cbid__']).toBeUndefined()
    })

    s.send({ baner: 'Nisse' }, (data) => {
      expect(data.baner).toEqual('Nisse')
      expect(data['$__cbid__']).toBeUndefined()
      done()
    })
  })

  it('should support alternative on syntax for events', (done) => {
    s.on('message', (data) => {
      expect(data.message).toEqual('Welcome')
      done()
    })
  })
})
