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

// Event function names
const EVENTS = ['open', 'message', 'close', 'error']

// The connection class
class Socket {
  constructor (options = {}) {
    // Bind event functions to this instance
    for (const e of EVENTS) this[e] = this[e].bind(this)

    // Store options
    if (!options.timeout) options.timeout = TIMEOUT
    if (!options.url) options.url = URL
    if (typeof options.reconnect === 'undefined') {
      options.reconnect = true
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
      for (let e of EVENTS) {
        this.socket[`${type}EventListener`](e, this[e])
      }
    }
  }

  // Register events
  on (event, fn) {
    this.options[event] = fn
  }

  // Connect to web socket server
  connect () {
    if (this.readyState > CONNECTING) this.disconnect()
    this.socket = new WebSocket(this.options.url)
    this.listeners('add')
  }

  // Reconnect with a timer
  reconnect () {
    if (this.options.reconnect) {
      this.listeners('remove')
      setTimeout(() => { this.connect() }, this.options.timeout)
    }
  }

  // Disconnect socket
  disconnect (code = CLOSE_NORMAL) {
    this.socket.close(code)
  }

  // Socket open event
  open (event) {
    if (this.options.open) this.options.open(event)
  }

  // Socket message event
  message (event) {
    let data = JSON.parse(event.data)
    const handler = this.getCallback(data) || this.options.message
    if (handler) handler(data, event)
  }

  // Socket close event
  close (event) {
    if (this.options.close) this.options.close(event)
    if (event.code !== CLOSE_NORMAL) this.reconnect()
  }

  // Socket error event
  error (event) {
    if (this.socket.readyState === CLOSED) this.reconnect()
    if (this.options.error) this.options.error(event)
  }

  // Send object to server
  send (obj, callback) {
    if (this.socket.readyState === OPEN) {
      if (callback) this.addCallback(obj, callback)
      this.socket.send(JSON.stringify(obj))
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
