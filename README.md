# Reconnecting Websocket

Implementation of an isomorphic automatically reconnecting websocket client.

Message format is JSON. Works perfectly with Node.js servers, script or Server Side Rendering.

### Install
```
npm i wsrecon
```

### Usage
The client wraps the normal WebSocket browser client or uses the ws Node.js client if not in the browser.

```js
const client = require('wsrecon')

// Awaits the connection ready
const socket = await client('ws://localhost:6000', {
  // Reconnect timeout in ms, set to false to not automatically reconnect
  timeout: 1
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
```

MIT licensed. Enjoy!
