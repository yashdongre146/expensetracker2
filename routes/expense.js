const express = require('express');
const expenseController = require('../controllers/expense');
const userAuthentication = require('../middleware/auth')

const router = express.Router();

router.post('/addExpense', userAuthentication.auth, expenseController.addExpense)
router.get('/getExpense', userAuthentication.auth, expenseController.getExpense)
router.delete('/deleteExpense/:expenseId', userAuthentication.auth,expenseController.deleteExpense)

module.exports = router;