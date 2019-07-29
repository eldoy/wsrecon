const WebSocket = require('isomorphic-ws')

// Connection ready states for web socket
const CONNECTING = 0
const OPEN = 1
const CLOSING = 2
const CLOSED = 3

// Connection close codes
const CLOSE_NORMAL = 1000

// Default options
const TIMEOUT = 1000
const URL = 'ws://localhost:6000'

// Callback identifier
const CBID = '$cbid'

// Event function names
const EVENTS = ['open', 'message', 'close', 'error']

// The connection class
class Socket {
  constructor (url, options = {}) {
    // Events
    this.events = {}

    for (const e of EVENTS) {
      // Support for multiple events
      this.events[e] = []

      // Bind event functions to this instance
      this[e] = this[e].bind(this)
    }

    // Store url
    this.url = url || URL

    // Store options
    if (typeof options.reconnect === 'undefined' || options.reconnect === true) {
      options.reconnect = TIMEOUT
    }
    this.options = options

    // Callbacks for sends
    this.callbacks = {}
    this.callbackId = 0

    // Connect to socket
    this.connect()
  }

  // Ready state
  get readyState () {
    return this.socket ? this.socket.readyState : -1
  }

  // Modify event listeners, type is 'add' or 'remove'
  listeners (type) {
    if (this.socket) {
      for (const e of EVENTS) {
        this.socket[`${type}EventListener`](e, this[e])
        if (type === 'remove') {
          this.events[e] = []
        }
      }
    }
  }

  // Register events
  on (name, fn) {
    this.events[name].push(fn)
  }

  // Connect to web socket server
  connect () {
    if (this.readyState > CONNECTING) {
      this.disconnect()
    }
    this.socket = new WebSocket(this.url)
    this.listeners('add')
  }

  // Reconnect with a timer
  reconnect () {
    if (this.options.reconnect) {
      setTimeout(() => { this.connect() }, this.options.reconnect)
    }
  }

  // Disconnect socket
  disconnect (code = CLOSE_NORMAL) {
    this.socket.close(code)
  }

  // Emit event functions
  emit (name, ...args) {
    for (const fn of this.events[name]) {
      fn(...args)
    }
  }

  // Socket message event
  message (event) {
    const data = JSON.parse(event.data)
    const callback = this.getCallback(data)
    callback ? callback(data, event) : this.emit('message', data, event)
  }

  // Socket open event
  open (event) {
    this.emit('open', event)
  }

  // Socket close event
  close (event) {
    this.listeners('remove')
    this.emit('close', event)
    if (event.code !== CLOSE_NORMAL) {
      this.reconnect()
    }
  }

  // Socket error event
  error (event) {
    this.listeners('remove')
    this.emit('error', event)
    if (this.readyState === CLOSED) {
      this.reconnect()
    }
  }

  // Send object to server
  send (obj) {
    if (this.readyState === OPEN) {
      this.socket.send(JSON.stringify(obj))
    }
  }

  // Fetch object from server
  // Returns promise if no callback given
  fetch (obj, callback) {
    if (this.readyState === OPEN) {
      return new Promise((resolve) => {
        this.addCallback(obj, callback || ((data) => { resolve(data) }))
        this.send(obj)
      })
    }
  }

  // Add callback for this object
  addCallback (obj, callback) {
    const id = ++this.callbackId
    obj[CBID] = id
    this.callbacks[id] = callback
  }

  // Get callback for data
  getCallback (data) {
    const id = data[CBID]
    if (id) {
      delete data[CBID]
      const callback = this.callbacks[id]
      if (callback) {
        delete this.callbacks[id]
        return callback
      }
    }
  }
}

module.exports = Socket
