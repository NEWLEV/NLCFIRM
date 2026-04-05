const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { notifyAdminNewLead } = require('../services/email');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ─── HELPER: audit logger ───────────────────────────
async function auditLog(req, action, entityType, entityId, details) {
  try {
    const db = await getDb();
    await db.run(
      'INSERT INTO audit_log (user_id, user_email, action, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user?.id || null, req.user?.email || 'system', action, entityType, entityId || null, details || null, req.ip]
    );
  } catch (e) { /* silent */ }
}

// ─── MULTER CONFIGURATION ───────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDFs, and Word docs are allowed'));
  }
});

// ═══════════════════════════════════════════════════════
//  PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════

// GET /api/config/paypal — public endpoint to expose PayPal client ID for frontend SDK
router.get('/config/paypal', (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID || 'test' });
});

// POST /api/submissions — handle all form submissions
router.post('/submissions', [
  body('firstName').trim().notEmpty().escape().withMessage('First name is required'),
  body('lastName').trim().notEmpty().escape().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('organization').optional().trim().escape(),
  body('orgSize').optional().trim().escape(),
  body('industry').optional().trim().escape(),
  body('message').optional().trim().escape(),
  body('contactMethod').optional().trim().escape(),
  body('serviceType').optional().trim().escape(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, organization, orgSize, industry, message, contactMethod, serviceType } = req.body;
  
  try {
    const db = await getDb();
    const result = await db.run(`
      INSERT INTO submissions (first_name, last_name, email, organization, org_size, industry, message, contact_method, service_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [firstName, lastName, email, organization || null, orgSize || null, industry || null, message || null, contactMethod || 'Email', serviceType || null]);

    // Send email notification non-blocking
    notifyAdminNewLead({ firstName, lastName, email, organization, serviceType, message }).catch(err => console.error("Email notify error:", err));

    res.status(201).json({ message: 'Submission received successfully', id: result.lastID });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// POST /api/exit-lead — capture exit-intent email
router.post('/exit-lead', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await getDb();
    const existing = await db.get('SELECT id FROM exit_leads WHERE email = ?', [req.body.email]);
    if (!existing) {
      await db.run('INSERT INTO exit_leads (email) VALUES (?)', [req.body.email]);
    }
    res.status(201).json({ message: 'Lead captured successfully' });
  } catch (err) {
    console.error('Exit lead error:', err);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

// POST /api/chat-log — log chatbot conversation
router.post('/chat-log', [
  body('sessionId').trim().notEmpty().withMessage('Session ID required'),
  body('role').isIn(['user', 'bot']).withMessage('Role must be user or bot'),
  body('message').trim().notEmpty().escape().withMessage('Message required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await getDb();
    await db.run('INSERT INTO chat_logs (session_id, role, message) VALUES (?, ?, ?)', [
      req.body.sessionId, req.body.role, req.body.message
    ]);
    res.status(201).json({ message: 'Chat logged' });
  } catch (err) {
    console.error('Chat log error:', err);
    res.status(500).json({ error: 'Failed to log chat' });
  }
});

// GET /api/services — public services list
router.get('/services', async (req, res) => {
  try {
    const db = await getDb();
    const { category } = req.query;
    let query = 'SELECT * FROM services WHERE is_visible = 1';
    const params = [];
    if (category) { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY sort_order, id';
    res.json({ services: await db.all(query, params) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/testimonials — public testimonials list
router.get('/testimonials', async (req, res) => {
  try {
    const db = await getDb();
    res.json({ testimonials: await db.all('SELECT * FROM testimonials WHERE is_visible = 1 ORDER BY sort_order, id') });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// GET /api/faq — public FAQ list
router.get('/faq', async (req, res) => {
  try {
    const db = await getDb();
    res.json({ faq: await db.all('SELECT * FROM faq_items WHERE is_visible = 1 ORDER BY sort_order, id') });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch FAQ' });
  }
});

// GET /api/settings — public site settings
router.get('/settings', async (req, res) => {
  try {
    const db = await getDb();
    const { category } = req.query;
    let query = 'SELECT key, value, category FROM site_settings';
    const params = [];
    if (category) { query += ' WHERE category = ?'; params.push(category); }
    res.json({ settings: await db.all(query, params) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// ═══════════════════════════════════════════════════════
//  PROTECTED ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════

// ─── DASHBOARD ──────────────────────────────────────
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();

    const { count: totalSubmissions } = await db.get('SELECT COUNT(*) as count FROM submissions');
    const byStatus = await db.all('SELECT status, COUNT(*) as count FROM submissions GROUP BY status');
    const { count: last30Days } = await db.get("SELECT COUNT(*) as count FROM submissions WHERE created_at >= datetime('now', '-30 days')");
    const { count: totalExitLeads } = await db.get('SELECT COUNT(*) as count FROM exit_leads');
    const { count: totalChatSessions } = await db.get('SELECT COUNT(DISTINCT session_id) as count FROM chat_logs');
    const { count: totalServices } = await db.get('SELECT COUNT(*) as count FROM services');
    const { count: visibleServices } = await db.get('SELECT COUNT(*) as count FROM services WHERE is_visible = 1');

    const recent = await db.all('SELECT * FROM submissions ORDER BY created_at DESC LIMIT 10');
    const byService = await db.all("SELECT service_type, COUNT(*) as count FROM submissions WHERE service_type IS NOT NULL GROUP BY service_type ORDER BY count DESC");

    const dailyStats = await db.all(`
      SELECT date(created_at) as date, COUNT(*) as count
      FROM submissions
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date
    `);

    // Recent audit log entries
    const recentActivity = await db.all(
      'SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 15'
    );

    res.json({
      totalSubmissions,
      byStatus,
      last30Days,
      totalExitLeads,
      totalChatSessions,
      totalServices,
      visibleServices,
      recent,
      byService,
      dailyStats,
      recentActivity,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ─── SUBMISSIONS ────────────────────────────────────
router.get('/submissions', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { status, search, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM submissions WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR organization LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const rows = await db.all(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM submissions WHERE 1=1';
    const countParams = [];
    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (search) {
      countQuery += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR organization LIKE ?)';
      const s = `%${search}%`;
      countParams.push(s, s, s, s);
    }
    const { total } = await db.get(countQuery, countParams);

    res.json({ submissions: rows, total, limit: Number(limit), offset: Number(offset) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// GET /api/submissions/:id — single submission detail
router.get('/submissions/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM submissions WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Submission not found' });
    res.json({ submission: row });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// PATCH /api/submissions/:id — update submission status or notes
router.patch('/submissions/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const updates = [];
    const params = [];

    if (req.body.status) {
      const validStatuses = ['new', 'contacted', 'qualified', 'closed-won', 'closed-lost'];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updates.push('status = ?');
      params.push(req.body.status);
    }
    if (req.body.admin_notes !== undefined) {
      updates.push('admin_notes = ?');
      params.push(req.body.admin_notes);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);

    const result = await db.run(`UPDATE submissions SET ${updates.join(', ')} WHERE id = ?`, params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    await auditLog(req, 'update_submission', 'submissions', Number(req.params.id), JSON.stringify(req.body));
    res.json({ message: 'Submission updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// DELETE /api/submissions/:id
router.delete('/submissions/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM submissions WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Submission not found' });
    await auditLog(req, 'delete_submission', 'submissions', Number(req.params.id));
    res.json({ message: 'Submission deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// ─── EXIT LEADS ─────────────────────────────────────
router.get('/exit-leads', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const leads = await db.all('SELECT * FROM exit_leads ORDER BY created_at DESC');
    res.json({ leads, total: leads.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exit leads' });
  }
});

router.delete('/exit-leads/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM exit_leads WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// ─── CSV EXPORT ─────────────────────────────────────
router.get('/export/submissions', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM submissions ORDER BY created_at DESC');

    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Organization', 'Org Size', 'Industry', 'Message', 'Contact Method', 'Service Type', 'Status', 'Admin Notes', 'Created At'];
    const csv = [
      headers.join(','),
      ...rows.map(r => [
        r.id,
        `"${(r.first_name || '').replace(/"/g, '""')}"`,
        `"${(r.last_name || '').replace(/"/g, '""')}"`,
        r.email,
        `"${(r.organization || '').replace(/"/g, '""')}"`,
        r.org_size || '',
        r.industry || '',
        `"${(r.message || '').replace(/"/g, '""')}"`,
        r.contact_method || '',
        r.service_type || '',
        r.status,
        `"${(r.admin_notes || '').replace(/"/g, '""')}"`,
        r.created_at,
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=nlc-submissions.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).send('Failed to export submissions');
  }
});

router.get('/export/exit-leads', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM exit_leads ORDER BY created_at DESC');
    const csv = ['ID,Email,Created At', ...rows.map(r => `${r.id},${r.email},${r.created_at}`)].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=nlc-exit-leads.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).send('Failed to export exit leads');
  }
});

// ═══════════════════════════════════════════════════════
//  SERVICES MANAGEMENT
// ═══════════════════════════════════════════════════════

router.get('/services', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { category, visible } = req.query;
    let query = 'SELECT * FROM services WHERE 1=1';
    const params = [];
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (visible !== undefined) { query += ' AND is_visible = ?'; params.push(Number(visible)); }
    query += ' ORDER BY category, sort_order, id';
    res.json({ services: await db.all(query, params) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.post('/services', authenticateToken, [
  body('category').trim().notEmpty().withMessage('Category required'),
  body('name').trim().notEmpty().withMessage('Service name required'),
  body('price').trim().notEmpty().withMessage('Price required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const db = await getDb();
    const { category, name, description, price, price_unit, tags, sort_order } = req.body;
    const result = await db.run(
      'INSERT INTO services (category, name, description, price, price_unit, tags, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [category, name, description || '', price, price_unit || 'one-time', JSON.stringify(tags || []), sort_order || 0]
    );

    await auditLog(req, 'create_service', 'services', result.lastID, `Created: ${name}`);
    res.status(201).json({ message: 'Service created', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.patch('/services/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const fields = ['category', 'name', 'description', 'price', 'price_unit', 'tags', 'is_visible', 'sort_order'];
    const updates = [];
    const params = [];

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(f === 'tags' ? JSON.stringify(req.body[f]) : req.body[f]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No updates provided' });
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);

    const result = await db.run(`UPDATE services SET ${updates.join(', ')} WHERE id = ?`, params);
    if (result.changes === 0) return res.status(404).json({ error: 'Service not found' });

    await auditLog(req, 'update_service', 'services', Number(req.params.id), JSON.stringify(req.body));
    res.json({ message: 'Service updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/services/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM services WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Service not found' });
    await auditLog(req, 'delete_service', 'services', Number(req.params.id));
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// ═══════════════════════════════════════════════════════
//  TESTIMONIALS MANAGEMENT
// ═══════════════════════════════════════════════════════

router.get('/testimonials', async (req, res) => {
  try {
    const db = await getDb();
    res.json({ testimonials: await db.all('SELECT * FROM testimonials ORDER BY sort_order, id') });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

router.post('/testimonials', authenticateToken, [
  body('quote').trim().notEmpty().withMessage('Quote required'),
  body('author_name').trim().notEmpty().withMessage('Author name required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const db = await getDb();
    const { quote, author_name, author_role, author_initials, rating, sort_order } = req.body;
    const initials = author_initials || author_name.split(' ').map(w => w[0]).join('').toUpperCase();
    const result = await db.run(
      'INSERT INTO testimonials (quote, author_name, author_role, author_initials, rating, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [quote, author_name, author_role || '', initials, rating || 5, sort_order || 0]
    );

    await auditLog(req, 'create_testimonial', 'testimonials', result.lastID);
    res.status(201).json({ message: 'Testimonial created', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

router.patch('/testimonials/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const fields = ['quote', 'author_name', 'author_role', 'author_initials', 'rating', 'is_visible', 'sort_order'];
    const updates = [];
    const params = [];

    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No updates' });
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);

    const result = await db.run(`UPDATE testimonials SET ${updates.join(', ')} WHERE id = ?`, params);
    if (result.changes === 0) return res.status(404).json({ error: 'Testimonial not found' });

    await auditLog(req, 'update_testimonial', 'testimonials', Number(req.params.id));
    res.json({ message: 'Testimonial updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

router.delete('/testimonials/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Testimonial not found' });
    await auditLog(req, 'delete_testimonial', 'testimonials', Number(req.params.id));
    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// ═══════════════════════════════════════════════════════
//  FAQ MANAGEMENT
// ═══════════════════════════════════════════════════════

router.get('/faq', async (req, res) => {
  try {
    const db = await getDb();
    res.json({ faq: await db.all('SELECT * FROM faq_items ORDER BY sort_order, id') });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch FAQ' });
  }
});

router.post('/faq', authenticateToken, [
  body('question').trim().notEmpty().withMessage('Question required'),
  body('answer').trim().notEmpty().withMessage('Answer required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const db = await getDb();
    const { question, answer, sort_order } = req.body;
    const result = await db.run(
      'INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)',
      [question, answer, sort_order || 0]
    );

    await auditLog(req, 'create_faq', 'faq_items', result.lastID);
    res.status(201).json({ message: 'FAQ created', id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

router.patch('/faq/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const fields = ['question', 'answer', 'is_visible', 'sort_order'];
    const updates = [];
    const params = [];

    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No updates' });
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);

    const result = await db.run(`UPDATE faq_items SET ${updates.join(', ')} WHERE id = ?`, params);
    if (result.changes === 0) return res.status(404).json({ error: 'FAQ not found' });

    await auditLog(req, 'update_faq', 'faq_items', Number(req.params.id));
    res.json({ message: 'FAQ updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

router.delete('/faq/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM faq_items WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'FAQ not found' });
    await auditLog(req, 'delete_faq', 'faq_items', Number(req.params.id));
    res.json({ message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// ═══════════════════════════════════════════════════════
//  SITE SETTINGS
// ═══════════════════════════════════════════════════════

router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { category } = req.query;
    let query = 'SELECT * FROM site_settings';
    const params = [];
    if (category) { query += ' WHERE category = ?'; params.push(category); }
    query += ' ORDER BY category, key';
    res.json({ settings: await db.all(query, params) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.patch('/settings', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const { updates } = req.body; // Array of { key, value }
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates array required' });
    }

    // SQLite driver doesn't support the same .transaction() as better-sqlite3
    // We can use a simple async loop
    for (const item of updates) {
      await db.run("UPDATE site_settings SET value = ?, updated_at = datetime('now') WHERE key = ?", [item.value, item.key]);
    }

    await auditLog(req, 'update_settings', 'site_settings', null, `Updated ${updates.length} settings`);
    res.json({ message: `${updates.length} settings updated` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ═══════════════════════════════════════════════════════
//  AUDIT LOG
// ═══════════════════════════════════════════════════════

router.get('/audit-log', authenticateToken, requireRole('super_admin'), async (req, res) => {
  try {
    const db = await getDb();
    const { limit = 100, offset = 0 } = req.query;
    const logs = await db.all('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ? OFFSET ?', [
      Number(limit), Number(offset)
    ]);
    const { total } = await db.get('SELECT COUNT(*) as total FROM audit_log');
    res.json({ logs, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// ═══════════════════════════════════════════════════════
//  CHAT LOG VIEWER
// ═══════════════════════════════════════════════════════

router.get('/chat-sessions', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const sessions = await db.all(`
      SELECT session_id, MIN(created_at) as started_at, MAX(created_at) as last_message,
             COUNT(*) as message_count
      FROM chat_logs
      GROUP BY session_id
      ORDER BY last_message DESC
      LIMIT 50
    `);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

router.get('/chat-sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const messages = await db.all(
      'SELECT * FROM chat_logs WHERE session_id = ? ORDER BY created_at ASC',
      [req.params.sessionId]
    );
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session messages' });
  }
});

// ═══════════════════════════════════════════════════════
//  ADMIN: CLIENT MANAGEMENT
// ═══════════════════════════════════════════════════════

router.get('/admin/clients', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const clients = await db.all(`
      SELECT c.id, c.email, c.first_name, c.last_name, c.company, c.is_active, c.created_at, c.last_login,
             COUNT(p.id) as total_purchases
      FROM clients c
      LEFT JOIN client_purchases p ON c.id = p.client_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json({ clients });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch client list' });
  }
});

router.post('/admin/clients/:id/purchases', [
  authenticateToken,
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('productName').notEmpty().withMessage('Product Name is required'),
  body('accessLink').notEmpty().withMessage('Access Link is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { productId, productName, accessLink } = req.body;
  
  try {
    const db = await getDb();
    const result = await db.run(`
      INSERT INTO client_purchases (client_id, product_id, product_name, access_link)
      VALUES (?, ?, ?, ?)
    `, [req.params.id, productId, productName, accessLink]);

    await auditLog(req, 'grant_purchase', 'client', req.params.id, `Granted standard product access: ${productName}`);
    res.status(201).json({ message: 'Purchase granted successfully', id: result.lastID });
  } catch (err) {
    console.error('Grant Purchase Error:', err);
    res.status(500).json({ error: 'Failed to grant purchase' });
  }
});

// POST /api/admin/upload
router.post('/admin/upload', authenticateToken, requireRole('super_admin', 'admin'), (req, res) => {
  upload.single('file')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Multer error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the relative URL for the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      url: fileUrl, 
      filename: req.file.originalname,
      size: req.file.size
    });
  });
});

module.exports = router;
