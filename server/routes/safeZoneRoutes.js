const express = require('express');
const router = express.Router();
const safeZoneController = require('../controllers/safeZoneController');
const { authMiddleware } = require('../middleware/auth');

// All safe zone endpoints are protected
router.use(authMiddleware);

// GET /api/safezones/stats -> Aggregated stats with item and skill counts
router.get('/stats', safeZoneController.getSafeZonesStats);

// GET /api/safezones/:id/listings -> Listings (items + skills) at this safe zone
router.get('/:id/listings', safeZoneController.getZoneListings);

// GET /api/safezones -> Basic list of active safe zones
router.get('/', safeZoneController.getSafeZones);

module.exports = router;
