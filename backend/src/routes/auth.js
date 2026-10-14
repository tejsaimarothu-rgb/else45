const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const db = require('../db');
const redis = require('../redis');
const { sendVerificationEmail } = require('../mailer');

const REDIS_TTL = 60 * 60 * 24; // 24 hours in seconds
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// ─── Middleware ────────────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  // Basic validation
  if (!name || !email || !password)
    return res.status(400).json({ error: 'name, email, and password are required' });

  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const emailLower = email.toLowerCase().trim();

  try {
    // 1. Check if email already in PostgreSQL (verified user)
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'An account with this email already exists' });

    // 2. Check if there's already a pending registration in Redis
    const pendingKey = `pending:${emailLower}`;
    const alreadyPending = await redis.get(pendingKey);
    if (alreadyPending)
      return res.status(409).json({
        error: 'A verification email was already sent. Please check your inbox or wait 24 hours to re-register.',
      });

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Generate verification token
    const token = uuidv4();

    // 5. Store pending registration in Redis
    const pendingData = JSON.stringify({ name, email: emailLower, passwordHash, token });
    await redis.setex(pendingKey, REDIS_TTL, pendingData);
    await redis.setex(`token:${token}`, REDIS_TTL, emailLower); // reverse lookup

    // 6. Send verification email
    await sendVerificationEmail(emailLower, name, token);

    return res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/auth/verify?token= ─────────────────────────────────────────────

router.get('/verify', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Verification token is required' });

  try {
    // 1. Look up the email from the token
    const email = await redis.get(`token:${token}`);
    if (!email) return res.status(400).json({ error: 'Verification link is invalid or has expired' });

    // 2. Get pending registration details
    const pendingKey = `pending:${email}`;
    const pendingRaw = await redis.get(pendingKey);
    if (!pendingRaw) return res.status(400).json({ error: 'Verification link is invalid or has expired' });

    const { name, passwordHash } = JSON.parse(pendingRaw);

    // 3. Insert verified user into PostgreSQL
    await db.query(
      'INSERT INTO users (name, email, password_hash, verified) VALUES ($1, $2, $3, TRUE) ON CONFLICT (email) DO NOTHING',
      [name, email, passwordHash]
    );

    // 4. Clean up Redis
    await redis.del(`token:${token}`);
    await redis.del(pendingKey);

    return res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'email and password are required' });

  const emailLower = email.toLowerCase().trim();

  try {
    // 1. Find user in PostgreSQL
    const result = await db.query('SELECT * FROM users WHERE email = $1', [emailLower]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // 2. Must be verified
    if (!user.verified)
      return res.status(403).json({ error: 'Please verify your email before logging in' });

    // 3. Compare password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    // 4. Sign JWT
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Set httpOnly cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ message: 'Login successful', user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
});

module.exports = router;
