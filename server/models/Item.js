const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['sell', 'rent'],
      required: true,
      index: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    rentPerDay: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ['textbooks', 'electronics', 'appliances', 'drafters', 'uniforms', 'other'],
      default: 'other',
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
      index: true,
    },
    safeZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SafeZone',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);
