const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/stats/public -> Public aggregate metrics (No auth, cached 60s)
router.get('/public', statsController.getPublicStats);

// GET /api/stats/me -> Logged-in user's personalized stats (Protected)
router.get('/me', authMiddleware, statsController.getMyStats);

module.exports = router;
