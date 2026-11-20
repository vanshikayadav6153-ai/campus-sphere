const Transaction = require('../models/Transaction');
const User = require('../models/User');

// GET /api/ledger/mine (Paginated, newest first)
exports.getMyLedger = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const total = await Transaction.countDocuments({ user: req.user._id });
    const transactions = await Transaction.find({ user: req.user._id })
      .populate({
        path: 'request',
        populate: { path: 'skill', select: 'title kind category creditsPerHour' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/ledger/summary (credits, heldCredits, total earned, total spent)
exports.getLedgerSummary = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Aggregate lifetime earnings (escrow_release_in)
    const earnedAgg = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'escrow_release_in' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Aggregate lifetime spendings (escrow_release_out)
    const spentAgg = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'escrow_release_out' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalEarned = earnedAgg[0]?.total || 0;
    const totalSpent = Math.abs(spentAgg[0]?.total || 0);

    res.status(200).json({
      success: true,
      summary: {
        credits: user.credits,
        heldCredits: user.heldCredits || 0,
        totalEarned,
        totalSpent,
      },
    });
  } catch (error) {
    next(error);
  }
};
