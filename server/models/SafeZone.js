const mongoose = require('mongoose');

const safeZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    locationType: {
      type: String,
      enum: ['library', 'mess', 'gate', 'canteen', 'admin', 'other'],
      default: 'library',
    },
    coordinates: {
      type: [Number], // [latitude, longitude]
      required: true,
      default: [28.6692, 77.4538],
    },
    icon: {
      type: String,
      default: '📍', // Emoji representation for Leaflet map markers
    },
    safetyNote: {
      type: String,
      default: 'CCTV covered, guarded campus zone',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SafeZone', safeZoneSchema);
