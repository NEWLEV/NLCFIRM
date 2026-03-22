const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');
const { sendClientWelcome, sendPasswordReset } = require('../services/email');
const crypto = require('crypto');

const router = express.Router();

// Middleware specifically for Clients
function authenticateClient(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, client) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    if (client.role !== 'client') return res.status(403).json({ error: 'Client privilege required' });
    req.client = client;
    next();
  });
}

// ═══════════════════════════════════════════════════════
//  PUBLIC CLIENT ENDPOINTS
// ═══════════════════════════════════════════════════════

// POST /api/client/auth/register
router.post('/auth/register', [
  body('firstName').trim().notEmpty().escape().withMessage('First name is required'),
  body('lastName').trim().notEmpty().escape().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().trim().escape(),
  body('company').optional().trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, phone, company } = req.body;
  const db = getDb();

  try {
    const existing = db.prepare('SELECT id FROM clients WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hash = bcrypt.hashSync(password, 12);
    const result = db.prepare(`
      INSERT INTO clients (email, password_hash, first_name, last_name, phone, company)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(email, hash, firstName, lastName, phone || null, company || null);
    
    // Automatically log them in
    const newClientId = result.lastInsertRowid;
    const token = jwt.sign(
      { id: newClientId, email, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send Welcome Email non-blocking
    sendClientWelcome(firstName, email).catch(err => console.error("Welcome email error:", err));

    res.status(201).json({
      message: 'Registration successful',
      token,
      client: { id: newClientId, email, firstName, lastName }
    });
  } catch (err) {
    console.error('Client Registration Error:', err);
    res.status(500).json({ error: 'Failed to register account' });
  }
});

// POST /api/client/auth/login
router.post('/auth/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const db = getDb();

  try {
    const client = db.prepare('SELECT * FROM clients WHERE email = ?').get(email);
    if (!client) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (!client.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Contact support.' });
    }

    const valid = bcrypt.compareSync(password, client.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    db.prepare("UPDATE clients SET last_login = datetime('now') WHERE id = ?").run(client.id);

    const token = jwt.sign(
      { id: client.id, email: client.email, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      client: {
        id: client.id,
        email: client.email,
        firstName: client.first_name,
        lastName: client.last_name,
        company: client.company
      }
    });

  } catch (err) {
    console.error('Client Login Error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// POST /api/client/auth/forgot-password
router.post('/auth/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  const db = getDb();

  try {
    const client = db.prepare('SELECT id, email FROM clients WHERE email = ?').get(email);
    if (!client) {
      // Security best practice: don't reveal if user exists. 
      // Just say if account exists, email was sent.
      return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    db.prepare('UPDATE clients SET reset_token = ?, reset_expires = ? WHERE id = ?')
      .run(token, expires, client.id);

    const resetLink = `${req.protocol}://${req.get('host')}/reset-password.html?token=${token}`;
    
    sendPasswordReset(email, resetLink).catch(err => console.error("Password reset email error:", err));

    res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// POST /api/client/auth/reset-password
router.post('/auth/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, password } = req.body;
  const db = getDb();

  try {
    const client = db.prepare('SELECT id FROM clients WHERE reset_token = ? AND reset_expires > datetime(?)')
      .get(token, new Date().toISOString());

    if (!client) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hash = bcrypt.hashSync(password, 12);
    db.prepare('UPDATE clients SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?')
      .run(hash, client.id);

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});


// ═══════════════════════════════════════════════════════
//  PROTECTED CLIENT ENDPOINTS
// ═══════════════════════════════════════════════════════

router.use(authenticateClient);

// GET /api/client/profile
router.get('/profile', (req, res) => {
  const db = getDb();
  const client = db.prepare('SELECT id, email, first_name, last_name, phone, company, created_at FROM clients WHERE id = ?').get(req.client.id);
  res.json({ client });
});

// GET /api/client/purchases
router.get('/purchases', (req, res) => {
  const db = getDb();
  const purchases = db.prepare('SELECT * FROM client_purchases WHERE client_id = ? ORDER BY purchased_at DESC').all(req.client.id);
  res.json({ purchases });
});

// GET /api/client/subscriptions
router.get('/subscriptions', (req, res) => {
  const db = getDb();
  const subscriptions = db.prepare('SELECT * FROM client_subscriptions WHERE client_id = ? ORDER BY created_at DESC').all(req.client.id);
  res.json({ subscriptions });
});

module.exports = router;
