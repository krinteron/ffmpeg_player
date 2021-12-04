const fs = require('fs')
const path = require('path')
const checkDiskSpace = require('check-disk-space').default
const ffprobe = require('ffprobe')
const ffprobeStatic = require('ffprobe-static')

const dirPath = '../playlist/videos'
const homePath = '/home/node'

exports.get_assets = async function (req, res) {
  const listName = fs.readdirSync(dirPath, 'utf8')
  const list = []

  await Promise.all(listName.map(async (file) => {
    const filePath = path.resolve(dirPath, file)
    let duration
    let nbFrames
    let frameRate
    await ffprobe(filePath, { path: ffprobeStatic.path })
      .then(({ streams }) => {
        const info = streams.filter((stream) => stream.codec_name === 'h264')[0]
        duration = info.duration
        nbFrames = info.nb_frames
        frameRate = info.avg_frame_rate.split('/')[0]
      })
      .then(() => {
        list.push({
          name: file,
          duration,
          nbFrames,
          frameRate
        })
      })
  })).then(() => {
    return checkDiskSpace(homePath)
  }).then(({ size, free }) => {
    res.json({
      list,
      diskSpace: {
        size,
        free
      }
    })
  })
}
