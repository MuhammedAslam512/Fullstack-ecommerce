// PASSPORT GOOGLE OAUTH CONFIGURATION (WITH PKCE)
// -------------------------------------------------------------------
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy (
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id_for_docker',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret_for_docker',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      state: true, // 🛡️ Anti-CSRF OAuth State Parameter
      pkce: true   // 🛡️ PKCE (Proof Key for Code Exchange - SHA-256)
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          return done(null, user);
        }
        
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          user.googleId = profile.id;
          user.authProvider = 'google';
          if (!user.avatar) {
            user.avatar = profile.photos[0].value;
          }
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }
        
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          authProvider: 'google',
          isEmailVerified: true
        });
        
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

