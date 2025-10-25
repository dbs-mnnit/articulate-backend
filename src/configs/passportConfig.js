import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import authRepo from "../modules/auth/authRepo.js";
import dotenv from 'dotenv'
dotenv.config();


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user based on Google profile
        let user = await authRepo.findUserByEmail(profile.emails[0].value);
        if (!user) {
          user = await authRepo.createUser({
            first_name: profile.name.givenName || "Unknown",
            last_name: profile.name.familyName || "Unknown",
            email: profile.emails[0].value,
            password: null, // No password for Google OAuth users
            isEmailVerified: true, // Email verified by Google
            profile_picture: profile.photos[0]?.value || null,
            role: "user",
          });
        } else if (!user.isActive) {
          return done(null, false, { message: "Account is inactive" });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user to session (minimal, as we use JWTs)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await authRepo.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;