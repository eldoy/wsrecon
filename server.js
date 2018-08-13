// Simple bouncing web socket server
const uuidv4 = require('uuid/v4')
const WebSocket = require('ws')

let connections = []

const server = new WebSocket.Server({ port: 6000 })

server.on('connection', (socket) => {
  socket.id = uuidv4()
  connections.push(socket)

  console.log('Connections:', connections.length)

  socket.send(JSON.stringify({ message: 'Welcome' }))

  socket.on('message', (msg) => {
    console.log('Received:', msg)
    for (const s of connections) {
      s.send(msg)
    }
  })

  // Remove dead connection on close
  socket.on('close', () => {
    console.log('Closed', socket.id)
    connections = connections.filter(s => s.id !== socket.id)
  })
})
