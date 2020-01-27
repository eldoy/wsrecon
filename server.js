const Sirloin = require('sirloin')

const app = new Sirloin({ port: 6000 })
app.action('*', async (data, client) => {
  return data
})
