// Connection ready states for web socket
const CONNECTING = 0
const OPEN = 1
const CLOSING = 2
const CLOSED = 3

// Connection close codes
const CLOSE_NORMAL = 1000

// Default options
const TIMEOUT = 3000
const URL = 'ws://localhost:3001'

// Callback identifier
const CALLBACK_ID = '$__cbid__'

// These are the event functions
const EVENTS = ['open', 'message', 'close', 'error']

// The connection class
class Socket {
  constructor (options = {}) {
    // Bind to this object
    for (const e of EVENTS) {
      this[e] = this[e].bind(this)
    }

    // Default options
    if (!options.timeout) {
      options.timeout = TIMEOUT
    }

    if (!options.url) {
      options.url = URL
    }

    if (typeof options.reconnect === 'undefined') {
      options.reconnect = true
    }

    // Store options
    this.options = options

    // Callbacks for sends
    this.callbacks = {}
    this.callbackId = 0

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
      for (let e of EVENTS) {
        this.socket[`${type}EventListener`](e, this[e])
      }
    }
  }

  // Alternative syntax for events
  on (event, fn) {
    this.options[event] = fn
  }

  // Connect to web socket server
  connect () {
    // Create a new socket
    if (this.socket && this.readyState > CONNECTING) {
      this.disconnect()
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
  disconnect (code = CLOSE_NORMAL) {
    this.socket.close(code)
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

    // Pass to callback or event handler
    const callback = this.getCallback(data)
    if (callback) {
      callback(data, event)
    } else if (this.options.message) {
      this.options.message(data, event)
    }
  }

  // Socket close event
  close (event) {
    if (event.code !== CLOSE_NORMAL) {
      this.reconnect()
    }

    // Call the options close callback
    if (this.options.close) {
      this.options.close(event)
    }
  }

  // Socket error event
  error (event) {
    if (this.socket.readyState === CLOSED) {
      this.reconnect()
    }

    // Call the options error callback
    if (this.options.error) {
      this.options.error(event)
    }
  }

  // Send object to server
  send (obj, callback) {
    if (this.socket.readyState === OPEN) {
      if (typeof callback === 'function') {
        this.addCallback(obj, callback)
      }
      const data = JSON.stringify(obj)
      this.socket.send(data)
    }
  }

  // Add callback for this object
  addCallback (obj, callback) {
    const id = ++this.callbackId
    obj[CALLBACK_ID] = id
    this.callbacks[id] = callback
  }

  // Get callback for data
  getCallback (data) {
    const id = data[CALLBACK_ID]
    if (id) {
      delete data[CALLBACK_ID]
      const callback = this.callbacks[id]
      if (callback) {
        delete this.callbacks[id]
        return callback
      }
    }
  }
}

module.exports = Socket
