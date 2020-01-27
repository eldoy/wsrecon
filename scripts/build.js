#!/usr/bin/env node
const fs = require('fs')
const lib = require('../index.js')
const fn = 'socket'
const code = `window.${fn} = ${lib.toString()}\n`

if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist')
}

fs.writeFileSync(`./dist/${fn}.js`, code)
