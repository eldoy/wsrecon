// Connection ready states for web socket
const CONNECTING = 0
const OPEN = 1
const CLOSING = 2
const CLOSED = 3

// Connection close codes
const CLOSE_NORMAL = 1000

// Default options
const TIMEOUT = 3000
const URL = 'ws://localhost:6000'

// Callback identifier
const CALLBACK_ID = '$__cbid__'

// Event function names
const EVENTS = ['open', 'message', 'close', 'error']

// The connection class
class Socket {
  constructor (url, options = {}) {
    // Bind event functions to this instance
    for (const e of EVENTS) this[e] = this[e].bind(this)

    // Store url
    this.url = url || URL

    // Store options
    if (!options.timeout) options.timeout = TIMEOUT
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
    this.socket = new WebSocket(this.url)
    this.listeners('add')
  }

  // Reconnect with a timer
  reconnect () {
    if (this.options.reconnect) {
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
    this.listeners('remove')
    if (this.options.close) this.options.close(event)
    if (event.code !== CLOSE_NORMAL) this.reconnect()
  }

  // Socket error event
  error (event) {
    this.listeners('remove')
    if (this.options.error) this.options.error(event)
    if (this.readyState === CLOSED) this.reconnect()
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
      if (callback) {
        this.addCallback(obj, callback)
        this.send(obj)
      } else {
        return new Promise((resolve, reject) => {
          this.addCallback(obj, (data) => { resolve(data) })
          this.send(obj)
        })
      }
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
