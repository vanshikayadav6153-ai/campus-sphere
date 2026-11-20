const Transaction = require('../models/Transaction');
const User = require('../models/User');

/**
 * Creates the initial +10 signup bonus ledger entry for a user
 */
const recordSignupBonus = async (user, session = null) => {
  try {
    const existing = await Transaction.findOne({
      user: user._id,
      type: 'signup_bonus',
    });

    if (!existing) {
      const opts = session ? { session } : {};
      await Transaction.create(
        [
          {
            user: user._id,
            type: 'signup_bonus',
            amount: 10,
            balanceAfter: user.credits || 10,
            note: 'Welcome to CampusSphere starting credits allocation',
            createdAt: user.createdAt || new Date(),
          },
        ],
        opts
      );
    }
  } catch (error) {
    console.error(`Failed to record signup bonus for user ${user._id}:`, error.message);
  }
};

/**
 * Migration script: checks all existing users and adds signup_bonus if missing
 */
const migrateSignupBonuses = async () => {
  try {
    const users = await User.find({});
    let count = 0;
    for (const user of users) {
      const exists = await Transaction.findOne({
        user: user._id,
        type: 'signup_bonus',
      });
      if (!exists) {
        await Transaction.create({
          user: user._id,
          type: 'signup_bonus',
          amount: 10,
          balanceAfter: user.credits,
          note: 'Welcome to CampusSphere starting credits allocation (Migrated)',
          createdAt: user.createdAt || new Date(),
        });
        count++;
      }
    }
    if (count > 0) {
      console.log(`📦 Migrated signup_bonus ledger entries for ${count} existing users.`);
    }
  } catch (error) {
    console.warn('Migration warning:', error.message);
  }
};

module.exports = {
  recordSignupBonus,
  migrateSignupBonuses,
};
