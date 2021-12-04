const fs = require('fs')
const EventEmitter = require('events')

const { processBus } = require('./processBus')

const bus = new EventEmitter()
let sendIntervalID = null
let counter = 0
let startFrame = 0
let currentPlaylistName = ''
let event

const currentPlaylistPath = '/tmp/ffmpeg-current-playlist.txt'
const currentFramePath = '/tmp/ffmpeg-current-frame.txt'

const parseName = (fullPath) => {
  const pathData = fullPath.split('/')
  const playlistName = pathData[pathData.length - 1]
  return playlistName
}

//generate event object
setInterval(() => {
  if (!fs.existsSync(currentPlaylistPath)) {
    event = {
      currentPlaylist: '',
      startFrame: 0,
      currentFrame: 0
    }
  } else {
    const playlistData = fs.readFileSync(currentPlaylistPath, 'utf8')

    const playlistName = parseName(playlistData) || ''
    const currentFrame = fs.existsSync(currentFramePath) ? fs.readFileSync(currentFramePath, 'utf8') : 0
    if (currentPlaylistName !== playlistName) {
      currentPlaylistName = playlistName
      startFrame = currentFrame
    }
    event = {
      currentPlaylist: currentPlaylistName,
      startFrame,
      currentFrame
    }
  }
}, 1000)

bus.on('client-connected', () => {
  if (counter === 0) { bus.emit('start-monitoring') }
  counter++
})
bus.on('client-diconnected', () => {
  counter--
  if (counter === 0) {
    clearInterval(sendIntervalID)
  }
})
//sending event object
bus.on('start-monitoring', () => {
  clearInterval(sendIntervalID)
  sendIntervalID = setInterval(() => {
    processBus.emit('list', event)
  }, 1000)
})

module.exports = {
  userBus: bus
}
