const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['signup_bonus', 'escrow_hold', 'escrow_release_out', 'escrow_release_in', 'refund'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true, // Signed number: negative for money leaving, positive for arriving
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BarterRequest',
      default: null,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
