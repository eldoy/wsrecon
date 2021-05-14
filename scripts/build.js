#!/usr/bin/env node
const fs = require('fs')
const uglify = require('uglify-es')

console.log('Building...')

const lib = require('../index.js')
const fn = 'wsrecon'
const code = `window.${fn} = ${lib.toString()}\n`
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist')
}
fs.writeFileSync(`./dist/${fn}.js`, code)

console.log('Minifying...')

const result = uglify.minify(code)
fs.writeFileSync(`./dist/${fn}-min.js`, result.code)
