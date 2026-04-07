const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  
  try {
    const db = await getDb();
    const [users] = await db.execute('SELECT * FROM admin_users WHERE email = ?', [email]);
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Contact your administrator.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login time
    await db.execute("UPDATE admin_users SET last_login = NOW() WHERE id = ?", [user.id]);

    // Log the login
    await db.execute(
      'INSERT INTO audit_log (user_id, user_email, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.email, 'login', 'User logged in', req.ip]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.display_name,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(
      'SELECT id, email, role, display_name, created_at, last_login FROM admin_users WHERE id = ?',
      [req.user.id]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /auth/change-password
router.post('/change-password', authenticateToken, [
  body('currentPassword').isLength({ min: 6 }).withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  
  try {
    const db = await getDb();
    const [rows] = await db.execute('SELECT * FROM admin_users WHERE id = ?', [req.user.id]);
    const user = rows[0];
    
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await db.execute("UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?", [hash, req.user.id]);

    // Audit log
    await db.execute(
      'INSERT INTO audit_log (user_id, user_email, action, details) VALUES (?, ?, ?, ?)',
      [req.user.id, req.user.email, 'change_password', 'Password changed']
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// POST /auth/update-profile
router.post('/update-profile', authenticateToken, [
  body('displayName').trim().notEmpty().withMessage('Display name required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await getDb();
    await db.execute("UPDATE admin_users SET display_name = ?, updated_at = NOW() WHERE id = ?", [
      req.body.displayName,
      req.user.id
    ]);

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /auth/users — super_admin only
router.get('/users', authenticateToken, requireRole('super_admin'), async (req, res) => {
  try {
    const db = await getDb();
    const [users] = await db.execute(
      'SELECT id, email, display_name, role, is_active, last_login, created_at FROM admin_users ORDER BY created_at ASC'
    );
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /auth/users — create a new admin user (super_admin only)
router.post('/users', authenticateToken, requireRole('super_admin'), [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('displayName').trim().notEmpty().withMessage('Display name required'),
  body('role').isIn(['admin', 'super_admin']).withMessage('Invalid role'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, displayName, role } = req.body;
  
  try {
    const db = await getDb();
    const [existingRows] = await db.execute('SELECT id FROM admin_users WHERE email = ?', [email]);
    if (existingRows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.execute(
      'INSERT INTO admin_users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)',
      [email, hash, displayName, role]
    );

    // Audit
    await db.execute(
      'INSERT INTO audit_log (user_id, user_email, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.email, 'create_user', 'admin_users', result.insertId, `Created user: ${email}`]
    );

    res.status(201).json({ message: 'User created successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /auth/users/:id — toggle active / update role (super_admin only)
router.patch('/users/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
  const userId = Number(req.params.id);

  // Prevent self-deactivation
  if (userId === req.user.id && req.body.is_active === 0) {
    return res.status(400).json({ error: 'You cannot deactivate your own account' });
  }

  const updates = [];
  const params = [];
  if (req.body.is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(req.body.is_active ? 1 : 0);
  }
  if (req.body.role) {
    updates.push('role = ?');
    params.push(req.body.role);
  }
  if (req.body.displayName) {
    updates.push('display_name = ?');
    params.push(req.body.displayName);
  }
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No updates provided' });
  }

  updates.push("updated_at = NOW()");
  
  try {
    const db = await getDb();
    const [result] = await db.execute(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`, [...params, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Audit
    await db.execute(
      'INSERT INTO audit_log (user_id, user_email, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, req.user.email, 'update_user', 'admin_users', userId, JSON.stringify(req.body)]
    );

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
