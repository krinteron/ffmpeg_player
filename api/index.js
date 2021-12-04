const express = require('express')
const compression = require('compression')

// Create express instance
const app = express()

// Require API routes
const videos = require('./routes/videos')
const upload = require('./routes/upload')
const activeCard = require('./routes/activeCard')
const cards = require('./routes/cards')

app.use(express.json())
app.use(compression())
// Import API Routes
app.use(videos)
app.use(upload)
app.use(activeCard)
app.use(cards)

// Export express app
module.exports = app

// Start standalone server if directly running
if (require.main === module) {
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on port ${port}`)
  })
}
