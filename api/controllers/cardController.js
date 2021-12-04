const fs = require('fs')
const path = require('path')
const { execFile, spawn } = require('child_process')

const cardsPath = '../playlist'
const orderPath = 'orderCards/order.txt'
const usedVideoPath = 'orderCards/videos.txt'
const currentFramePath = '/tmp/ffmpeg-current-frame.txt'
const activeCardPath = '/tmp/ffmpeg-current-playlist.txt'

let activeCard = ''

const parseName = (str) => {
  const chunkPath = str.replace(/'/g, '').split('/')
  return chunkPath[chunkPath.length - 1].trim()
}

const getActiveCard = () => {
  if (!fs.existsSync(activeCardPath)) { return }
  const playlist = fs.readFileSync(activeCardPath, 'utf8').split('/')
  activeCard = parseName(playlist[0])
}

const delInactiveCards = (list) => {
  list.forEach((item) => {
    if (item !== activeCard && item !== 'videos') {
      const itemPath = path.resolve(cardsPath, item)
      fs.unlinkSync(itemPath)
    }
  })
}

exports.get_cards = function (req, res) {
  getActiveCard()
  fs.readdir(cardsPath, 'utf8', (err, cards) => {
    if (err) { res.json('Playlist read error') }
    const order = fs.readFileSync(orderPath, 'utf8').split('\n')
    const sortedCards = []
    order.forEach((item) => {
      cards.forEach((cardName) => {
        if (cardName === item) { sortedCards.push(cardName) }
      })
    })
    const data = sortedCards.map((cardName) => {
      const cardPath = path.resolve(cardsPath, cardName)
      const cardData = fs.readFileSync(cardPath, 'utf8').split('\n')
      const fileName = parseName(cardData[1])
      const nextCard = parseName(cardData[2].split(' ')[1])
      return {
        cardName,
        fileName,
        nextCard
      }
    })
    res.json({ data })
  })
}

exports.post_cards = function (req, res) {
  getActiveCard()

  const currentCards = fs.readdirSync(cardsPath, 'utf8')
  delInactiveCards(currentCards)
  const cards = req.body.data
  const newOrderCards = []
  const usedVideo = []

  const accCards = []

  const length = cards.length

  if (!length) {
    return
  }

  if (length === 1) {
    const currentCard = {}
    currentCard.cardName = cards[0].cardName || Math.random().toString(36).slice(2) + '.txt'
    currentCard.fileName = cards[0].fileName
    currentCard.nextCard = cards[0].nextCard || currentCard.cardName
    accCards.push(currentCard)
    newOrderCards.push(currentCard.cardName)
    usedVideo.push(currentCard.fileName)
  }

  if (length > 1) {
    for (let i = 0; i < length; i++) {
      const currentCard = {}
      if (i === 0) {
        currentCard.cardName = cards[i].cardName || cards[length - 1].nextCard || Math.random().toString(36).slice(2) + '.txt'
      } else {
        currentCard.cardName = cards[i].cardName || cards[i - 1].nextCard || accCards[i - 1].nextCard || cards[length - 1].nextCard || Math.random().toString(36).slice(2) + '.txt'
      }
      currentCard.fileName = cards[i].fileName
      if (i === length - 1) {
        currentCard.nextCard = cards[i].nextCard || accCards[0].cardName
      } else {
        currentCard.nextCard = cards[i].nextCard || cards[i + 1].cardName || Math.random().toString(36).slice(2) + '.txt'
      }
      if (i === length - 1) {
        if (currentCard.cardName === activeCard) {
          accCards[0].cardName = currentCard.nextCard
        }
      }
      accCards.push(currentCard)
      newOrderCards.push(currentCard.cardName)
      usedVideo.push(currentCard.fileName)
    }
  }

  accCards.forEach((card) => {
    const cardPath = path.resolve(cardsPath, card.cardName)
    const assetPath = 'videos/' + card.fileName
    const nextCardtPath = card.nextCard
    const head = 'ffconcat version 1.0'
    const assetName = `file '${assetPath}'`
    const nextCard = `file '${nextCardtPath}'`
    const data = [head, assetName, nextCard].join('\n')
    if (card.cardName !== activeCard) { fs.writeFileSync(cardPath, data, 'utf8') }
  })

  fs.writeFileSync(orderPath, newOrderCards.join('\n'), 'utf8')
  fs.writeFileSync(usedVideoPath, usedVideo.join('\n'), 'utf8')

  res.json({ data: 'Saved!' })
}

exports.play_card = function (req, res) {
  const videoName = req.body.fileName
  const child = spawn('./bashScripts/playCard.sh', [videoName], { detached: true, stdio: 'ignore' })
  child.unref()
  fs.writeFileSync(activeCardPath, videoName, 'utf8')
  res.json({})
}

exports.stop_card = function (req, res) {
  execFile('./bashScripts/stop.sh', (err, stdout, stderr) => {
    fs.writeFileSync(activeCardPath, '', 'utf8')
    fs.writeFileSync(currentFramePath, '0', 'utf8')
    if (err || stderr) {
      res.json({
        err,
        stdout,
        stderr
      })
      return
    }
    res.json({})
  })
}

exports.reset_player = function (req, res) {
  execFile('./bashScripts/stop.sh', (err, stdout, stderr) => {
    fs.writeFileSync(activeCardPath, '', 'utf8')
    fs.writeFileSync(currentFramePath, '', 'utf8')
    fs.writeFileSync(orderPath, '', 'utf8')
    fs.writeFileSync(usedVideoPath, '', 'utf8')
    const cards = fs.readdirSync(cardsPath, 'utf-8')
      .filter(item => item !== 'videos')
    for (const card of cards) {
      fs.unlinkSync(path.resolve(cardsPath, card))
    }
    if (err || stderr) {
      res.json({
        err,
        stdout,
        stderr
      })
      return
    }
    res.json({})
  })
}
