const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const setupPassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID || 'placeholder_client_id',
        clientSecret: clientSecret || 'placeholder_client_secret',
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract primary email from Google profile
          const email = profile.emails && profile.emails[0]?.value?.toLowerCase().trim();
          if (!email) {
            return done(null, false, { message: 'no_email' });
          }

          // 🔒 Server-side Domain Restriction Check (MUST verify email ends with @ALLOWED_DOMAIN)
          const allowedDomain = (process.env.ALLOWED_DOMAIN || 'college.ac.in').toLowerCase().trim();
          const expectedSuffix = `@${allowedDomain}`;

          if (!email.endsWith(expectedSuffix)) {
            console.warn(`[Auth Gated] Login rejected for ${email}: domain does not end with ${expectedSuffix}`);
            return done(null, false, { message: 'domain' });
          }

          // Check if user already exists
          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (user) {
            // Update Google ID or avatar if changed
            if (!user.googleId) user.googleId = profile.id;
            if (profile.photos && profile.photos[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // 🎁 Create user on first login with 10 starting campus credits
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName || email.split('@')[0],
            email,
            avatar: profile.photos && profile.photos[0]?.value ? profile.photos[0].value : '',
            credits: 10,
            heldCredits: 0,
          });

          const { recordSignupBonus } = require('../utils/ledgerHelper');
          await recordSignupBonus(user);

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};

module.exports = setupPassport;
