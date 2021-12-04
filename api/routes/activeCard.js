const { Router } = require('express')

const { userBus } = require('../sse/userBus')

const { processBus } = require('../sse/processBus')

const router = Router()

router.get('/current-file', function (req, res) {
  userBus.emit('client-connected')
  console.log('client connected')

  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders() // flush the headers to establish SSE with client

  console.log('sending')

  processBus.on('list', (data) => {
    const { currentPlaylist, startFrame, currentFrame } = data
    res.write(`data: ${[currentPlaylist, startFrame, currentFrame]}\n\n`)
    res.flush()
  })

  res.on('close', () => {
    console.log('client dropped me')

    userBus.emit('client-diconnected')
  })
})

module.exports = router
