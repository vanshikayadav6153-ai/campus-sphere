const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/auth/google -> Starts OAuth (scope: profile, email)
router.get('/google', authController.googleAuth);

// GET /api/auth/google/callback -> OAuth callback with domain check & JWT cookie
router.get('/google/callback', authController.googleCallback);

// GET /api/auth/me (protected) -> Current authenticated user & credits
router.get('/me', authMiddleware, authController.getMe);

// POST /api/auth/logout -> Clears token cookie
router.post('/logout', authController.logout);

// POST /api/auth/dev-login -> Dev-only endpoint to test domain gating directly
router.post('/dev-login', authController.devLogin);

module.exports = router;
