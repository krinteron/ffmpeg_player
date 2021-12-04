const { Router } = require('express')

const router = Router()
const cardController = require('../controllers/cardController')
const fileController = require('../controllers/fileController')

router.get('/cards', cardController.get_cards)

router.post('/cards', cardController.post_cards)

router.post('/play-card', cardController.play_card)

router.post('/stop-card', cardController.stop_card)

router.post('/reset-player', cardController.reset_player)

router.post('/remove-file', fileController.remove_file)

module.exports = router
