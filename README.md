# Reconnecting Websocket

Implementation of an isomorphic automatically reconnecting websocket client. Sends also have support for callbacks through the `fetch` function.

Message format is JSON. Works perfectly with Node.js servers, script or Server Side Rendering with Next (React) or Nuxt (Vue).

### Install
```
npm i wsrecon
```

### Usage
The client wraps the normal WebSocket browser client or uses the ws Node.js client if not in the browser.

If the ping option is enabled, the client will send { $ping: 1 } and must receive { $pong: 1 } from the server. If the pong is not received and the ping timeout is reached, the socket is destroyed. Set ping to false if your server is not set up for it.
```js
const client = require('wsrecon')

// Awaits the connection ready
const socket = await client('ws://localhost:6000', {
  // Reconnect timeout in ms, set to false to not automatically reconnect
  reconnect: 1000,

  // Ping timeout in ms, set to false to not ping the server
  ping: false,

  // Disconnect timeout when $pong is not received
  disconnect: 3000,

  // Message event
  onmessage: function(data) {
    console.log(data)
  },

  // Open event
  onopen: function(socket, event) {
    console.log(socket, event)
  },

  // Error event
  onerror: function(event) {
    console.log(event)
  },

  // Close event
  onclose: function(event) {
    console.log(event)
  }
})

// Register events like this
socket.on('open', (event) => {
  console.log('Connection open')
})

socket.on('close', (event) => {
  console.log('Connection closed')
})

socket.on('error', (event) => {
  console.log('Connection error')
})

socket.on('message', (data, event) => {
  console.log('Received message', data)
})

// Send message, data arrives in message event
socket.send({ hello: 'socket' })

// Send message and fetch data with callback
socket.fetch({ hello: 'socket' }, (data) => {
  console.log('Received message', data)
})

// Send message and fetch data with promises
socket.fetch({ hello: 'socket' }).then((data) => {
  console.log('Received message', data)
})

// Send message and fetch data with async / await
const data = await socket.fetch({ hello: 'socket' })
console.log('Received message', data)
```

MIT licensed. Enjoy!
