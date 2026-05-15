const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Create new transaction (Fuel Sale / Wallet Funding)
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, fuelType, quantity, pumpId, paymentMethod } = req.body;

    const transaction = await Transaction.create({
      type,
      amount,
      fuelType,
      quantity,
      pumpId,
      userId: req.user._id,
      paymentMethod,
      status: 'completed'
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transactions by pump
// @route   GET /api/transactions/pump/:id
// @access  Private
exports.getPumpTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ pumpId: req.params.id }).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
