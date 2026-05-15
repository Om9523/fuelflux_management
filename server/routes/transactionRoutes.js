const express = require('express');
const router = express.Router();
const { createTransaction, getPumpTransactions } = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createTransaction);
router.get('/pump/:id', protect, getPumpTransactions);

module.exports = router;
