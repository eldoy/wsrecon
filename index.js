var WebSocket = require('isomorphic-ws')

module.exports = async function(url, options) {
  // Callback identifier
  var CBID = '$cbid'

  // Options
  if (!options) options = {}
  if (typeof options.reconnect === 'undefined' || options.reconnect === true) options.reconnect = 1000
  if (typeof options.disconnect === 'undefined') options.disconnect = 3000

  // Variables
  var socket, callbacks, cid, interval, timeout, events = {}

  // Events
  var EVENTS = ['message', 'open', 'close', 'error']
  for (var i = 0; i < EVENTS.length; i++) {
    events[EVENTS[i]] = []
  }

  // Register events
  function on(name, fn) {
    events[name].push(fn)
  }

  function run(name, ...args) {
    for (var i = 0; i < events[name].length; i++) {
      events[name][i](...args)
    }
  }

  function connect(resolve, reject) {
    callbacks = {}
    cid = 0
    socket = new WebSocket(url)

    socket.onmessage = function(event) {
      var data = JSON.parse(event.data)
      var id = data[CBID]
      if (id) {
        delete data[CBID]
        if (callbacks[id]) {
          callbacks[id](data, event)
          delete callbacks[id]
        }
      } else {
        run('message', data, event)
      }
    }

    socket.onopen = function(event) {
      if (resolve) resolve(api)
      run('open', api, event)
    }

    socket.onerror = function(event) {
      if (reject) reject(event)
      run('error', event)
    }

    socket.onclose = function(event) {
      if (options.reconnect) {
        setTimeout(connect, options.reconnect)
      }
      run('close', event)
    }
  }

  function disconnect(code) {
    socket.close(code || 1000)
  }

  function send(params) {
    if (socket.readyState == 1) {
      socket.send(JSON.stringify(params))
    }
  }

  function fetch(params) {
    return new Promise(function(resolve) {
      params[CBID] = ++cid
      callbacks[cid] = function(data) { resolve(data) }
      send(params)
    })
  }

  var api = { on, connect, send, fetch, disconnect }

  return new Promise(connect)
}
