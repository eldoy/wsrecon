const uuidv4 = require('uuid/v4')
const WebSocket = require('ws')

let connections = []

const server = new WebSocket.Server({ port: 6000 })

server.on('connection', function (socket) {
 socket.id = uuidv4()
 connections.push(socket)
 console.log('Connections:', connections.length)

 socket.send(JSON.stringify({ message: 'Welcome' }))

 socket.on('message', function (msg) {
   console.log('received:', msg)
   for (const s of connections) {
     s.send(msg)
   }
 })

 // Keep the ones that doesn't match the ID of this
 socket.on('close', function() {
   console.log('Closed', socket.id)
   connections = connections.filter(function(s){
     return s.id !== socket.id
   })
 })
})
