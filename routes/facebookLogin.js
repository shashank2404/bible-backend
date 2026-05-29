const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const User = require("../Database Models/userModels");

// Helper to get consistent redirect URI based on the actual request host
const getRedirectUri = (req) => {
  try {
    // Detect protocol (handle proxies like Hostinger)
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    // Use the actual host the user is visiting (matches www or no-www)
    const host = req.get("host");
    const uri = `${protocol}://${host}/api/auth/facebook/callback`;
    console.log("Dynamic Redirect URI generated:", uri);
    return uri;
  } catch (err) {
    console.error("Error in getRedirectUri:", err);
    return (process.env.CLIENT_URL || "https://thebibleglory.com").replace(/\/$/, "") + "/api/auth/facebook/callback";
  }
};

// ─── 1. START FACEBOOK AUTH ───────────────────────────────────
router.get("/auth/facebook", (req, res) => {
  try {
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      return res.status(400).send("Facebook configuration missing in .env");
    }

    const redirectUri = getRedirectUri(req);
    const fbAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email,public_profile&state=sacred_word_auth`;
    
    res.redirect(fbAuthUrl);
  } catch (err) {
    console.error("Error in /auth/facebook:", err);
    res.status(500).send("Internal Error");
  }
});

// ─── 2. FACEBOOK CALLBACK ─────────────────────────────────────
router.get("/auth/facebook/callback", async (req, res) => {
  const { code, error } = req.query;
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  const clientUrl = `${protocol}://${host}`;

  if (error) {
    return res.redirect(`${clientUrl}/login?error=${error}`);
  }

  if (!code) {
    return res.redirect(`${clientUrl}/login?error=no_code`);
  }

  try {
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

    const redirectUri = getRedirectUri(req);
    
    // A. Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`;
    
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("Facebook Token Exchange API Error:", tokenData.error);
      return res.redirect(`${clientUrl}/login?error=token_failed`);
    }

    const accessToken = tokenData.access_token;

    // B. Get user profile
    const profileUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture&access_token=${accessToken}`;
    const profileRes = await fetch(profileUrl);
    const profileData = await profileRes.json();

    if (profileData.error) {
      console.error("Facebook Profile Fetch API Error:", profileData.error);
      return res.redirect(`${clientUrl}/login?error=profile_failed`);
    }

    const { id, name, email, picture } = profileData;
    const fbEmail = email ? email.toLowerCase() : `${id}@facebook.com`;

    // C. Find or Create User
    let user = await User.findOne({ facebookId: id });
    if (!user) user = await User.findOne({ email: fbEmail });

    if (!user) {
      user = await User.create({
        name: name || "Facebook User",
        email: fbEmail,
        facebookId: id,
        picture: picture?.data?.url || "",
        authProvider: "facebook",
      });
    } else {
      let updated = false;
      if (!user.facebookId) { user.facebookId = id; updated = true; }
      if (user.authProvider !== 'facebook' && user.authProvider !== 'google') { user.authProvider = 'facebook'; updated = true; }
      if (updated) await user.save();
    }

    // D. Issue JWT and redirect
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${clientUrl}/login?token=${token}`);

  } catch (err) {
    console.error("Critical error in Facebook callback:", err);
    res.redirect(`${clientUrl}/login?error=server_crash`);
  }
});

module.exports = router;