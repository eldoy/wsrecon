const sirloin = require('sirloin')

const app = sirloin({ port: 6000 })
app.action('*', async (data, client) => {
  return data
})
