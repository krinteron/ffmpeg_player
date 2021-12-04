const fs = require('fs')
const path = require('path')

const dirPath = '../playlist/videos/'
const usedVideoPath = 'orderCards/videos.txt'

exports.remove_file = function (req, res) {
  const fileName = req.body.fileName
  const usedVideos = fs.readFileSync(usedVideoPath, 'utf8').split('\n')
  if (usedVideos.includes(fileName)) {
    return res.json({ error: 'video in use' })
  }
  const filePath = path.resolve(dirPath, fileName)
  try {
    fs.unlinkSync(filePath)
  } catch (err) {
    return res.json('File is not exist')
  }
  res.json(req.body.fileName)
}
