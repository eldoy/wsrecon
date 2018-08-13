# Reconnecting Websocket

Browser implementation of an automatically reconnecting websocket client.

Sends also have support for callbacks. Message format is JSON.

### Usage

```javascript
const socket = new Socket({
  url: 'ws://localhost:6000',
  timeout: 3000,
  reconnect: true,
  open: () => {
    console.log('Connection open')
  },
  message: (data) => {
    console.log('Received message', data)
  }
})

// Send message
socket.send({ hello: 'Flat world' })

// Send message with callback
socket.send({ hello: 'Flat world' }, (data) => {
  console.log('Received message', data)
})
```
Enjoy!
