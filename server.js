// Simple bouncing web socket server
const uuidv4 = require('uuid/v4')
const WebSocket = require('ws')

let connections = []

const server = new WebSocket.Server({ port: 6000 })
console.log('Websocket server listening on port 6000')

server.on('connection', (socket) => {
  socket.id = uuidv4()
  connections.push(socket)

  console.log('Connections:', connections.length)

  socket.send(JSON.stringify({ message: 'Welcome' }))

  socket.on('message', (msg) => {
    msg = JSON.parse(msg)
    console.log('Received: %o', msg)
    if (msg.$ping) {
      console.log('SENDING PONG')
      socket.send(JSON.stringify({ $pong: 1 }))
    } else {
      for (const s of connections) {
        s.send(JSON.stringify(msg))
      }
    }
  })

  // Remove dead connection on close
  socket.on('close', () => {
    console.log('Closed', socket.id)
    connections = connections.filter(s => s.id !== socket.id)
  })
})
