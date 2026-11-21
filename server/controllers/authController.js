const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});

// GET /api/auth/google
exports.googleAuth = async (req, res, next) => {
  const isPlaceholderKey =
    !process.env.GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID === 'xxxxx' ||
    process.env.GOOGLE_CLIENT_ID.includes('placeholder');

  // If using placeholder credentials, simulate instant OAuth login cleanly without Google 400 error
  if (isPlaceholderKey) {
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
    try {
      const allowedDomain = (process.env.ALLOWED_DOMAIN || 'gmail.com').toLowerCase().trim();
      const mockEmail = `student@${allowedDomain}`;
      let user = await User.findOne({ email: mockEmail });
      if (!user) {
        user = await User.create({
          googleId: `google_sim_${Date.now()}`,
          name: 'Vanshika Yadav',
          email: mockEmail,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(mockEmail)}`,
          credits: 10,
          heldCredits: 0,
        });
        const { recordSignupBonus } = require('../utils/ledgerHelper');
        await recordSignupBonus(user);
      }
      const token = signToken(user);
      res.cookie('token', token, getCookieOptions());
      return res.redirect(`${clientUrl}/dashboard?token=${encodeURIComponent(token)}`);
    } catch (err) {
      console.error('Simulated Google Auth Error:', err);
      return res.redirect(`${clientUrl}/login?error=auth_failed`);
    }
  }

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account',
  })(req, res, next);
};

// GET /api/auth/google/callback
exports.googleCallback = (req, res, next) => {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Google OAuth Authentication Error:', err);
      return res.redirect(`${clientUrl}/login?error=auth_failed`);
    }

    // 🔒 If domain verification failed or user not found
    if (!user) {
      const errorReason = info?.message === 'domain' ? 'domain' : 'domain';
      return res.redirect(`${clientUrl}/login?error=${errorReason}`);
    }

    // Sign JWT valid for 7 days
    const token = signToken(user);

    // Set JWT in httpOnly cookie
    res.cookie('token', token, getCookieOptions());

    // Redirect to Dashboard with token parameter for robust client auth syncing
    return res.redirect(`${clientUrl}/dashboard?token=${encodeURIComponent(token)}`);
  })(req, res, next);
};

// GET /api/auth/me (Protected)
exports.getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.clearCookie('token', {
    ...getCookieOptions(),
    maxAge: 0,
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// POST /api/auth/dev-login (Helper for testing domain restriction directly via API/cURL/UI)
exports.devLogin = async (req, res) => {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEMO_LOGIN === 'false') {
    return res.status(403).json({ success: false, message: 'Dev login disabled in production' });
  }

  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const allowedDomain = (process.env.ALLOWED_DOMAIN || 'college.ac.in').toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  // 🔒 Domain restriction check
  if (!normalizedEmail.endsWith(`@${allowedDomain}`)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Email must end with @${allowedDomain}`,
      error: 'domain',
    });
  }

  try {
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        googleId: `dev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`,
        credits: 10,
        heldCredits: 0,
      });

      const { recordSignupBonus } = require('../utils/ledgerHelper');
      await recordSignupBonus(user);
    }

    const token = signToken(user);
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
