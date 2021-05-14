window.wsrecon = function(url, opt) {
  if (!opt) opt = {}
  if (typeof opt.timeout == 'undefined') opt.timeout = 1

  // Variables
  var socket, events = {}

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

  function open(resolve, reject) {
    socket = new WebSocket(url)

    socket.onmessage = function(event) {
      var data = JSON.parse(event.data)
      run('message', data, event)
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
      if (opt.timeout) {
        setTimeout(open, opt.timeout)
      }
      run('close', event)
    }
  }

  function close(code) {
    socket.close(code || 1000)
  }

  function send(params) {
    if (socket.readyState == 1) {
      socket.send(JSON.stringify(params))
    }
  }

  var api = { on, open, send, close }

  return new Promise(open)
}
