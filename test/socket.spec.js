const Socket = require('../socket')
let s
let m

beforeAll((done) => {
  s = new Socket({
    url: 'ws://localhost:6000',
    open: () => {
      done()
    },
    message: (data) => {
      m = data
    }
  })
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
})
