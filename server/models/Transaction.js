const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fuel-sale', 'wallet-funding', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'cng', 'none'],
    default: 'none'
  },
  quantity: {
    type: Number,
    default: 0
  },
  pumpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pump',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'cash', 'card', 'wallet'],
    required: true
  },
  referenceId: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
