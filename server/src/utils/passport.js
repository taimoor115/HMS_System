import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import "dotenv/config";

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope:['profile', 'email']
    },
function (accessToken, refreshToken, profile, callback) {
    callback(null, profile);
}

))

console.log(process.env.CLIENT_ID);


// SerializeUser

// Purpose: This function determines which data should be stored in the session. It is called when a user is authenticated and their information needs to be saved to the session.
// Parameters:
// user: The user object that you want to serialize. This usually contains information about the user.
// done: A callback function that should be called once the serialization is complete. It takes two arguments:
// err: An error object if there was an error during serialization (or null if no error).
// id: The identifier for the user to be stored in the session (often, this could be the user's unique ID or a specific identifier).
passport.serializeUser((user, done) => {
	done(null, user);
});

// deserializeUser
// Purpose: This function is responsible for retrieving the full user object from the session data. It is called on every subsequent request to reconstruct the user object from the session.

// Parameters:

// id: The identifier that was stored in the session during serializeUser.
// done: A callback function that should be called once the deserialization is complete. It takes two arguments:
// err: An error object if there was an error during deserialization (or null if no error).
// user: The user object that has been fetched from the database or another source based on the identifier.

passport.deserializeUser((user, done) => {
	done(null, user);
});