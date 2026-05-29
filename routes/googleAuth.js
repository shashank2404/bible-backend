const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // apna sahi path check karo

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// ─── GOOGLE SIGN-IN ──────────────────────
router.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'No token provided' });

    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const payload = await response.json();
    if (!payload.email) return res.status(400).json({ error: 'Invalid Google token' });

    const { email, name, picture } = payload;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({ isNewUser: true, email, name, picture });
    }

    const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: jwtToken, name: user.name, picture: user.picture });

  } catch (err) {
    console.error('Google Sign-In Error:', err.message);
    res.status(500).json({ error: 'Google authentication failed: ' + err.message });
  }
});

// ─── GOOGLE REGISTER ─────────────────────
router.post('/auth/google/register', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'No token provided' });

    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const payload = await response.json();
    if (!payload.email) return res.status(400).json({ error: 'Invalid Google token' });

    const { email, name, picture } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token: jwtToken, name: user.name });
    }

    user = await User.create({
      name,
      email: email.toLowerCase(),
      picture,
      authProvider: 'google',
    });

    const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: jwtToken, name: user.name, message: 'Account created successfully!' });

  } catch (err) {
    console.error('Google Register Error:', err.message);
    res.status(500).json({ error: 'Could not create account: ' + err.message });
  }
});

module.exports = router;