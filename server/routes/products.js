const express = require('express');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');

const router = express.Router();

// ── Client auth middleware (inline for this file) ──────────────────────────
function authenticateClient(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });
  jwt.verify(token, process.env.JWT_SECRET, (err, client) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    if (client.role !== 'client') return res.status(403).json({ error: 'Client access required' });
    req.client = client;
    next();
  });
}

// ════════════════════════════════════════════════════════════
//  PUBLIC ENDPOINTS
// ════════════════════════════════════════════════════════════

// GET /api/products — list all active products
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(
      'SELECT product_id, name, description, price, delivery_type FROM products WHERE is_active = 1 ORDER BY price ASC'
    );
    res.json({ products: rows });
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:productId — single product detail
router.get('/:productId', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(
      'SELECT product_id, name, description, price, delivery_type FROM products WHERE product_id = ? AND is_active = 1',
      [req.params.productId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: rows[0] });
  } catch (err) {
    console.error('Product fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ════════════════════════════════════════════════════════════
//  PROTECTED CLIENT COURSE ENDPOINTS
// ════════════════════════════════════════════════════════════

// GET /api/products/course/:productId/progress — get client's course progress
router.get('/course/:productId/progress', authenticateClient, async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(
      'SELECT * FROM course_enrollments WHERE client_id = ? AND product_id = ?',
      [req.client.id, req.params.productId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not enrolled in this course' });
    }
    const enrollment = rows[0];
    res.json({
      enrollment: {
        ...enrollment,
        progress: enrollment.progress_json ? JSON.parse(enrollment.progress_json) : {}
      }
    });
  } catch (err) {
    console.error('Course progress fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch course progress' });
  }
});

// POST /api/products/course/:productId/progress — save module progress
router.post('/course/:productId/progress', authenticateClient, async (req, res) => {
  const { moduleId, completed, score } = req.body;
  if (!moduleId) return res.status(400).json({ error: 'moduleId is required' });

  try {
    const db = await getDb();
    const [rows] = await db.execute(
      'SELECT * FROM course_enrollments WHERE client_id = ? AND product_id = ?',
      [req.client.id, req.params.productId]
    );
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    const enrollment = rows[0];
    const progress = enrollment.progress_json ? JSON.parse(enrollment.progress_json) : {};
    progress[moduleId] = { completed: !!completed, score: score || 0, updatedAt: new Date().toISOString() };

    // Check if all 6 modules completed
    const allModules = ['m1','m2','m3','m4','m5','m6'];
    const allDone = allModules.every(m => progress[m] && progress[m].completed);

    await db.execute(
      `UPDATE course_enrollments 
       SET progress_json = ?, completed_at = ?, certificate_issued = ?
       WHERE client_id = ? AND product_id = ?`,
      [
        JSON.stringify(progress),
        allDone ? new Date() : enrollment.completed_at,
        allDone ? 1 : enrollment.certificate_issued,
        req.client.id,
        req.params.productId
      ]
    );

    res.json({ success: true, progress, courseCompleted: allDone });
  } catch (err) {
    console.error('Course progress save error:', err);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// GET /api/products/course/:productId/certificate — generate certificate token
router.get('/course/:productId/certificate', authenticateClient, async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(
      'SELECT ce.*, c.first_name, c.last_name FROM course_enrollments ce JOIN clients c ON ce.client_id = c.id WHERE ce.client_id = ? AND ce.product_id = ?',
      [req.client.id, req.params.productId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Enrollment not found' });
    const enrollment = rows[0];
    if (!enrollment.certificate_issued) return res.status(403).json({ error: 'Course not yet completed' });

    res.json({
      certificate: {
        name: `${enrollment.first_name} ${enrollment.last_name}`,
        course: 'Healthcare Compliance Certification',
        completedAt: enrollment.completed_at,
        issuedBy: 'New Level Consultants'
      }
    });
  } catch (err) {
    console.error('Certificate fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

module.exports = router;
