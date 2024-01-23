const express = require('express');
const userController = require('../controllers/user');

const router = express.Router();

router.post('/signup', userController.signup)
router.post('/login', userController.login)
router.post('/forgotPassword', userController.forgotPassword)
router.get('/reset-password/:uId', userController.resetPassword)
router.get('/update-password/:uId', userController.updatePassword)

module.exports = router;