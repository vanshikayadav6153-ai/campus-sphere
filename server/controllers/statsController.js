const User = require('../models/User');
const Skill = require('../models/Skill');
const Item = require('../models/Item');
const BarterRequest = require('../models/BarterRequest');

// In-memory cache for public stats (60 seconds TTL)
let publicStatsCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000;

// GET /api/stats/public (NO auth, aggregated numbers only, cached for 60s)
exports.getPublicStats = async (req, res, next) => {
  try {
    const now = Date.now();
    if (publicStatsCache && now - lastCacheTime < CACHE_TTL_MS) {
      return res.status(200).json({
        success: true,
        cached: true,
        stats: publicStatsCache,
      });
    }

    const [
      totalStudents,
      activeItems,
      activeSkills,
      itemsReused,
      completedReqAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments({ status: 'available' }),
      Skill.countDocuments({ status: 'open' }),
      Item.countDocuments({ status: 'sold' }),
      BarterRequest.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            completedSessions: { $sum: 1 },
            mentoringHours: { $sum: '$hours' },
            creditsExchanged: { $sum: '$credits' },
          },
        },
      ]),
    ]);

    const reqStats = completedReqAgg[0] || {
      completedSessions: 0,
      mentoringHours: 0,
      creditsExchanged: 0,
    };

    const stats = {
      totalStudents,
      activeItems,
      activeSkills,
      completedSessions: reqStats.completedSessions,
      mentoringHours: reqStats.mentoringHours,
      creditsExchanged: reqStats.creditsExchanged,
      itemsReused,
    };

    // Update in-memory cache
    publicStatsCache = stats;
    lastCacheTime = now;

    res.status(200).json({
      success: true,
      cached: false,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stats/me (Protected: user's personal engagement stats)
exports.getMyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      taughtAgg,
      learnedAgg,
      myActiveItems,
      myActiveSkills,
      myCompletedSessions,
      pendingIncomingRequests,
    ] = await Promise.all([
      // Hours and credits taught (user is provider and status completed)
      BarterRequest.aggregate([
        { $match: { provider: userId, status: 'completed' } },
        {
          $group: {
            _id: null,
            hoursTaught: { $sum: '$hours' },
            creditsEarned: { $sum: '$credits' },
          },
        },
      ]),
      // Hours and credits learned (user is learner and status completed)
      BarterRequest.aggregate([
        { $match: { learner: userId, status: 'completed' } },
        {
          $group: {
            _id: null,
            hoursLearned: { $sum: '$hours' },
            creditsSpent: { $sum: '$credits' },
          },
        },
      ]),
      Item.countDocuments({ owner: userId, status: 'available' }),
      Skill.countDocuments({ owner: userId, status: 'open' }),
      BarterRequest.countDocuments({
        $or: [{ provider: userId }, { learner: userId }],
        status: 'completed',
      }),
      BarterRequest.countDocuments({
        provider: userId,
        status: 'pending',
      }),
    ]);

    const taught = taughtAgg[0] || { hoursTaught: 0, creditsEarned: 0 };
    const learned = learnedAgg[0] || { hoursLearned: 0, creditsSpent: 0 };

    res.status(200).json({
      success: true,
      stats: {
        hoursTaught: taught.hoursTaught,
        hoursLearned: learned.hoursLearned,
        creditsEarned: taught.creditsEarned,
        creditsSpent: learned.creditsSpent,
        myActiveListings: myActiveItems + myActiveSkills,
        myCompletedSessions,
        pendingIncomingRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};
