const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getStats = async (req, res) => {
  try {
    const fuelStationsCount = await User.countDocuments({ role: 'pump-owner' });
    
    // We can count today's transactions for "Daily Transactions"
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailyTransactionsCount = await Transaction.countDocuments({
      timestamp: { $gte: startOfDay }
    });
    
    // Real values combined with fixed ones
    res.json({
      success: true,
      data: {
        fuelStations: fuelStationsCount,
        dailyTransactions: dailyTransactionsCount,
        uptimeSla: '99.9%',
        statesCovered: 15
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error fetching stats' });
  }
};
