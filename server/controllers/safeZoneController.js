const SafeZone = require('../models/SafeZone');
const Skill = require('../models/Skill');
const Item = require('../models/Item');
const mongoose = require('mongoose');

// Seed or Upsert real campus safe zones (preserves existing IDs and relationships)
const upsertDefaultSafeZones = async () => {
  const zones = [
    {
      name: 'Central Library Pod 1',
      description: 'Quiet study pod on ground floor with 24/7 CCTV surveillance and verified campus security.',
      locationType: 'library',
      coordinates: [28.6692, 77.4538],
      icon: '📚',
      safetyNote: '24/7 CCTV covered, guarded security desk, open till 10 PM',
      isActive: true,
    },
    {
      name: 'North Hostel Mess Lounge',
      description: 'Residential commons area with high student foot-traffic and desk attendance.',
      locationType: 'mess',
      coordinates: [28.6678, 77.4521],
      icon: '🍲',
      safetyNote: 'High foot-traffic dining hall, 24/7 lighting & attendance',
      isActive: true,
    },
    {
      name: 'Main Campus Security Gate',
      description: 'Primary campus entrance checkpoint with 24/7 guarded security and barrier monitoring.',
      locationType: 'gate',
      coordinates: [28.671, 77.4552],
      icon: '🛡️',
      safetyNote: 'Guarded main security checkpoint with active CCTV recording',
      isActive: true,
    },
    {
      name: 'Student Canteen & Commons',
      description: 'Central dining & activity hub with open visibility and continuous peer presence.',
      locationType: 'canteen',
      coordinates: [28.6685, 77.4545],
      icon: '☕',
      safetyNote: 'Central open student hub, well-lit commons, open till 9 PM',
      isActive: true,
    },
    {
      name: 'Admin Block Foyer',
      description: 'Administrative building entrance foyer with receptionist and security staff.',
      locationType: 'admin',
      coordinates: [28.6701, 77.453],
      icon: '🏛️',
      safetyNote: 'Monitored administrative foyer with campus security patrol',
      isActive: true,
    },
  ];

  for (const zone of zones) {
    await SafeZone.findOneAndUpdate(
      { name: zone.name },
      { $set: zone },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

// GET /api/safezones or /api/safe-zones
exports.getSafeZones = async (req, res, next) => {
  try {
    await upsertDefaultSafeZones();
    const safeZones = await SafeZone.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      safeZones,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/safezones/stats
// Single aggregation returning each zone + availableItemsCount + openSkillsCount
exports.getSafeZonesStats = async (req, res, next) => {
  try {
    await upsertDefaultSafeZones();

    const stats = await SafeZone.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'items',
          let: { zoneId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$safeZone', '$$zoneId'] },
                    { $eq: ['$status', 'available'] },
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'itemCounts',
        },
      },
      {
        $lookup: {
          from: 'skills',
          let: { zoneId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$safeZone', '$$zoneId'] },
                    { $eq: ['$status', 'open'] },
                    { $in: ['$mode', ['in-person', 'both']] },
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'skillCounts',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          locationType: 1,
          coordinates: 1,
          icon: 1,
          safetyNote: 1,
          isActive: 1,
          availableItemsCount: {
            $ifNull: [{ $arrayElemAt: ['$itemCounts.count', 0] }, 0],
          },
          openSkillsCount: {
            $ifNull: [{ $arrayElemAt: ['$skillCounts.count', 0] }, 0],
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.status(200).json({
      success: true,
      safeZones: stats,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/safezones/:id/listings
// Returns available items and open skills at that zone (max 20 each, newest first, populated owner)
exports.getZoneListings = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid safe zone ID format' });
    }

    const zone = await SafeZone.findById(id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Safe zone not found' });
    }

    const [items, skills] = await Promise.all([
      Item.find({ safeZone: id, status: 'available' })
        .populate('owner', 'name avatar email')
        .sort({ createdAt: -1 })
        .limit(20),
      Skill.find({
        safeZone: id,
        status: 'open',
        mode: { $in: ['in-person', 'both'] },
      })
        .populate('owner', 'name avatar email')
        .sort({ createdAt: -1 })
        .limit(20),
    ]);

    res.status(200).json({
      success: true,
      safeZone: zone,
      items,
      skills,
    });
  } catch (error) {
    next(error);
  }
};
