# Reconnecting Websocket

Browser implementation of an automatically reconnecting websocket client.

Sends also have support for callbacks. Message format is JSON.

### Install
```
npm i wsrecon
```

### Usage

```javascript
const Socket = require('wsrecon')

const socket = new Socket({
  url: 'ws://localhost:6000',
  timeout: 3000,
  reconnect: true,
  open: (event) => {
    console.log('Connection open')
  },
  close: (event) => {
    console.log('Connection closed')
  },
  error: (event) => {
    console.log('Connection error')
  },
  message: (data, event) => {
    console.log('Received message', data)
  }
})

// You can also register events like this
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

// Send message
socket.send({ hello: 'Flat world' })

// Send message with callback
socket.send({ hello: 'Flat world' }, (data) => {
  console.log('Received message', data)
})
```
MIT licensed. Enjoy!
