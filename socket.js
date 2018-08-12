/*******************************
/* Connection states for web socket
/* const CONNECTING = 0  // The connection is not yet open
/* const OPEN = 1        // The connection is open and ready to communicate
/* const CLOSING = 2     // The connection is in the process of closing
/* const CLOSED = 3      // The connection has been closed
*/

// These are the event functions
const events = ['open', 'message', 'close', 'error']

// The connection class
class Socket {
  constructor (options = {}) {
    // Bind to this object
    for (const e of events) {
      this[e] = this[e].bind(this)
    }

    // Default options
    if (!options.timeout) {
      options.timeout = 3000
    }

    if (!options.url) {
      options.url = 'ws://localhost:3001'
    }

    if (typeof options.reconnect === 'undefined') {
      options.reconnect = true
    }

    // Store options
    this.options = options

    // Set up socket connection
    this.connect()
  }

  // Ready state
  get readyState () {
    return this.socket.readyState
  }

  // Modify event listeners, type is 'add' or 'remove'
  listeners (type) {
    if (this.socket) {
      for (let e of events) {
        this.socket[`${type}EventListener`](e, this[e])
      }
    }
  }

  // Connect to web socket server
  connect () {
    // Create a new socket
    if (this.socket && this.socket.readyState > 0) {
      this.socket.close()
    }

    // Connect to socket
    this.socket = new WebSocket(this.options.url)

    // Add listeners
    this.listeners('add')
  }

  // Reconnect with a timer
  reconnect () {
    if (!this.options.reconnect) {
      return
    }

    // Remove listeners
    this.listeners('remove')

    // Reconnect every x seconds
    setTimeout(() => {
      this.connect()
    }, this.options.timeout)
  }

  // Disconnect socket
  disconnect (code) {
    this.socket.close(code || 1005)
  }

  // Socket open event
  open (event) {
    // Call the options open callback
    if (this.options.open) {
      this.options.open(event)
    }
  }

  // Socket message event
  message (event) {
    let data = JSON.parse(event.data)

    // Call the options message callback
    if (this.options.message) {
      this.options.message(JSON.stringify(data, null, 2), event)
    }
  }

  // Socket close event
  close (event) {
    if (event.code !== 1000) {
      this.reconnect()
    }

    // Call the options close callback
    if (this.options.close) {
      this.options.close(event)
    }
  }

  // Socket error event
  error (event) {
    if (this.socket.readyState === 3) {
      this.reconnect()
    }

    // Call the options error callback
    if (this.options.error) {
      this.options.error(event)
    }
  }

  // Send string through socket
  send (str) {
    if (this.socket.readyState === 1) {
      this.socket.send(str)
    }
  }
}

// For ES6 modules: export default Socket
window.Socket = Socket
