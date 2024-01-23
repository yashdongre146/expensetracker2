const express = require('express');
const purchaseController = require('../controllers/purchase');
const userAuthentication = require('../middleware/auth')

const router = express.Router();

router.get('/purchase', userAuthentication.auth, purchaseController.purchase)
router.post('/updateTransactionStatus', userAuthentication.auth, purchaseController.updateTransactionStatus)
router.get('/showLeaderboard', userAuthentication.auth, purchaseController.showLeaderboard)
router.get('/showHistory', userAuthentication.auth, purchaseController.showHistory)
router.get('/download', userAuthentication.auth, purchaseController.download)


module.exports = router;