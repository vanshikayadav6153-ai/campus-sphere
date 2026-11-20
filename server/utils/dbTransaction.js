const mongoose = require('mongoose');

/**
 * Executes a callback within a MongoDB session transaction if replica set is active,
 * or gracefully runs operations sequentially with atomic checks on standalone MongoDB.
 */
const runInTransaction = async (workFn) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    let result;

    try {
      await session.withTransaction(async () => {
        result = await workFn(session);
      });
      return result;
    } catch (txError) {
      // If error indicates standalone server without replica set
      if (
        txError.message &&
        (txError.message.includes('replica set') || txError.message.includes('Transaction numbers'))
      ) {
        console.warn('⚠️ Standalone MongoDB detected (no replica set). Executing with conditional atomic operations.');
        return await workFn(null);
      }
      throw txError;
    }
  } catch (err) {
    if (
      err.message &&
      (err.message.includes('replica set') || err.message.includes('Transaction numbers'))
    ) {
      return await workFn(null);
    }
    throw err;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = { runInTransaction };
