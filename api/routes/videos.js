const { Router } = require('express')

const router = Router()
const storageController = require('../controllers/storageController')

router.get('/assets', storageController.get_assets)

module.exports = router
