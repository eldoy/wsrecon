const sirloin = require('sirloin')

const app = sirloin({ port: 6000 })
app.action('*', async (data, client) => {
  return data
})

app.action('double', async (data, client) => {
  console.log('DOUBLE!')
  client.send({ hello: 1 })
  return { hello: 2 }
})
