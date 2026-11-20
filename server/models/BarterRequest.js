const mongoose = require('mongoose');

const barterRequestSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
      index: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    credits: {
      type: Number,
      required: true,
      min: 1, // Computed server-side as skill.creditsPerHour * hours
    },
    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    proposedSafeZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SafeZone',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    learnerConfirmed: {
      type: Boolean,
      default: false,
    },
    providerConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BarterRequest', barterRequestSchema);
