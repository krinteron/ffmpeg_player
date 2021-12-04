import fs from 'fs'
import path from 'path'
import multer from 'multer'

const { Router } = require('express')

const router = Router()
const dirPath = '../playlist/videos/'

const storage = multer.diskStorage({
  destination (req, file, cb) {
    cb(null, dirPath)
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.replace(/ /g, '')
    const fullFilePath = path.join(dirPath, fileName)
    cb(null, fileName)
    req.on('aborted', () => {
      file.stream.on('end', () => {
        fs.unlink(fullFilePath, (err) => {
          if (err) {
            throw err
          }
        })
      })
      file.stream.emit('end')
    })
  }
})

const upload = multer({
  storage
})

router.post('/upload', upload.single('file'), function (req, res, next) {
  res.json({ file: req.file })
})

module.exports = router
