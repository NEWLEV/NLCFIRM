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
    
    // Allow clients, admins, and super_admins to access the portal
    const allowedRoles = ['client', 'admin', 'super_admin'];
    if (!allowedRoles.includes(client.role)) {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
    
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
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, phone, company } = req.body;
  
  try {
    const db = await getDb();
    const [existingRows] = await db.execute('SELECT id FROM clients WHERE email = ?', [email]);
    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 12);
    const [insertResult] = await db.execute(
      'INSERT INTO clients (email, password_hash, first_name, last_name, phone, company) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hash, firstName, lastName, phone || null, company || null]
    );
    
    // Automatically log them in
    const newClientId = insertResult.insertId;
    const role = email.toLowerCase().endsWith('@nlcfirm.com') ? 'admin' : 'client';
    const token = jwt.sign(
      { id: newClientId, email, role: role, source: 'clients' },
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
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  
  try {
    const db = await getDb();
    const [clientRows] = await db.execute('SELECT * FROM clients WHERE email = ?', [email]);
    if (clientRows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const client = clientRows[0];
    
    if (!client.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Contact support.' });
    }

    const valid = await bcrypt.compare(password, client.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await db.execute('UPDATE clients SET last_login = NOW() WHERE id = ?', [client.id]);

    const role = email.toLowerCase().endsWith('@nlcfirm.com') ? 'admin' : 'client';
    const token = jwt.sign(
      { id: client.id, email: client.email, role: role, source: 'clients' },
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
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  
  try {
    const db = await getDb();
    const [clientRows] = await db.execute('SELECT id, email FROM clients WHERE email = ?', [email]);
    if (clientRows.length === 0) {
      return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }
    const client = clientRows[0];

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000).toISOString();

    await db.execute('UPDATE clients SET reset_token = ?, reset_expires = ? WHERE id = ?', [token, expires, client.id]);

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
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, password } = req.body;
  
  try {
    const db = await getDb();
    const [clientRows] = await db.execute(
      'SELECT id FROM clients WHERE reset_token = ? AND reset_expires > ?',
      [token, new Date().toISOString()]
    );

    if (clientRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    const client = clientRows[0];

    const hash = await bcrypt.hash(password, 12);
    await db.execute('UPDATE clients SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?', [hash, client.id]);

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
router.get('/profile', async (req, res) => {
  try {
    const db = await getDb();
    
    if (req.client.source === 'admin_users') {
      const [rows] = await db.execute(
        'SELECT id, email, display_name, role, created_at FROM admin_users WHERE id = ?',
        [req.client.id]
      );
      const admin = rows[0] || null;
      if (admin) {
        // Map admin fields to client expected format
        const nameParts = (admin.display_name || '').split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';
        res.json({ client: { id: admin.id, email: admin.email, first_name, last_name, phone: '', company: 'NLC Admin', created_at: admin.created_at } });
      } else {
        res.json({ client: null });
      }
    } else {
      const [rows] = await db.execute(
        'SELECT id, email, first_name, last_name, phone, company, created_at FROM clients WHERE id = ?',
        [req.client.id]
      );
      res.json({ client: rows[0] || null });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PATCH /api/client/profile
router.patch('/profile', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('company').optional().trim(),
  body('phone').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { firstName, lastName, company, phone } = req.body;

  try {
    const db = await getDb();
    
    if (req.client.source === 'admin_users') {
      await db.execute(
        'UPDATE admin_users SET display_name = ? WHERE id = ?',
        [`${firstName} ${lastName}`, req.client.id]
      );
    } else {
      await db.execute(
        'UPDATE clients SET first_name = ?, last_name = ?, company = ?, phone = ?, updated_at = NOW() WHERE id = ?',
        [firstName, lastName, company || null, phone || null, req.client.id]
      );
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/client/purchases
router.get('/purchases', async (req, res) => {
  try {
    const db = await getDb();
    const [purchases] = await db.execute(
      'SELECT * FROM client_purchases WHERE client_id = ? ORDER BY purchased_at DESC',
      [req.client.id]
    );
    res.json({ purchases });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// GET /api/client/subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const db = await getDb();
    const [subscriptions] = await db.execute(
      'SELECT * FROM client_subscriptions WHERE client_id = ? ORDER BY created_at DESC',
      [req.client.id]
    );
    res.json({ subscriptions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// GET /api/client/courses — list all enrolled courses with progress
router.get('/courses', async (req, res) => {
  try {
    const db = await getDb();
    const [enrollments] = await db.execute(
      `SELECT ce.*, p.name, p.description, p.delivery_value
       FROM course_enrollments ce
       JOIN products p ON ce.product_id = p.product_id
       WHERE ce.client_id = ?
       ORDER BY ce.enrolled_at DESC`,
      [req.client.id]
    );
    res.json({
      courses: enrollments.map(e => ({
        ...e,
        progress: e.progress_json ? JSON.parse(e.progress_json) : {}
      }))
    });
  } catch (err) {
    console.error('Courses fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

module.exports = router;
