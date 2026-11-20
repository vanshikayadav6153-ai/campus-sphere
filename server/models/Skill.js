const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    kind: {
      type: String,
      enum: ['offer', 'want'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['programming', 'design', 'academics', 'music', 'languages', 'career', 'other'],
      required: true,
      index: true,
    },
    creditsPerHour: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    mode: {
      type: String,
      enum: ['in-person', 'online', 'both'],
      required: true,
    },
    safeZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SafeZone',
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Skill', skillSchema);
