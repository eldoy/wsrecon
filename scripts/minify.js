#!/usr/bin/env node
const fs = require('fs')
const uglify = require('uglify-es')

const fn = 'socket'

if (!fs.existsSync(`./dist/${fn}.js`)) {
  console.log("Run 'npm run build' and try again")
} else {
  const code = fs.readFileSync(`./dist/${fn}.js`, 'utf-8')
  console.log(code)
  const result = uglify.minify(code)
  console.log(result)
  fs.writeFileSync(`./dist/${fn}-min.js`, result.code)
}
