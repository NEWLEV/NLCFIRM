require('dotenv').config();

const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const clientRoutes = require('./routes/client');
const paymentRoutes = require('./routes/payments');
const productRoutes = require('./routes/products');
const contactRoutes = require('./routes/contact');
const { getDb } = require('./db');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── STARTUP VALIDATION ───────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const weakSecrets = ['change-me', 'secret', 'jwt_secret', 'nlc-jwt-secret'];
  if (!process.env.JWT_SECRET || weakSecrets.some(w => process.env.JWT_SECRET.toLowerCase().includes(w))) {
    console.error('FATAL: JWT_SECRET is missing or insecure. Set a strong random secret in .env before running in production.');
    process.exit(1);
  }
  if (!process.env.SMTP_USER) {
    console.warn('WARNING: SMTP_USER not set — email notifications will be mocked.');
  }
}

// ─── SECURITY ─────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.paypal.com", "https://www.sandbox.paypal.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://www.paypal.com", "https://www.sandbox.paypal.com"],
      frameSrc: ["'self'", "https://www.paypal.com", "https://www.sandbox.paypal.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://nlcfirm.com' : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── RATE LIMITING ────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: 'Too many submissions, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── MIDDLEWARE ────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── PERFORMANCE ──────────────────────────────────────
app.use(compression());

// ─── DYNAMIC HTML DELIVERY (Injection) ────────────────
const fs = require('fs');

async function sendInjectedHtml(req, res, filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const db = await getDb();
    const [settingsRows] = await db.execute('SELECT `key`, value FROM site_settings');
    const settings = {};
    settingsRows.forEach(s => { settings[s.key] = s.value; });

    let injected = data;
    // Inject PayPal
    injected = injected.replace(/<%= PAYPAL_CLIENT_ID %>/g, process.env.PAYPAL_CLIENT_ID || 'AZqVCL__cDUGrTbkSoagrKi6wd8KOqDJ_vGY5YR-IATzoZPnbBDkzIc7HbTzQSfAiPxIUycDxQoBjlyp');
    
    // Inject Site Settings into a global object for JS access
    const settingsJson = JSON.stringify(settings).replace(/</g, '\\u003c');
    injected = injected.replace('</head>', `<script>window.NLC_SETTINGS = ${settingsJson};</script></head>`);

    // Dynamic Text Replacements (SEO & Hero)
    if (settings.hero_title) injected = injected.replace(/<%= HERO_TITLE %>/g, settings.hero_title);
    if (settings.hero_subtitle) injected = injected.replace(/<%= HERO_SUBTITLE %>/g, settings.hero_subtitle);
    if (settings.meta_title) injected = injected.replace(/<title>.*?<\/title>/, `<title>${settings.meta_title}</title>`);
    
    return res.send(injected);
  } catch (err) {
    console.error('Injection error:', err);
    // Fallback to basic file send if DB fails
    return res.sendFile(filePath);
  }
}

// Intercept HTML requests to inject variables
app.use(async (req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html')) {
    const filePath = path.join(__dirname, '..', 'public', req.path === '/' ? 'index.html' : req.path);
    if (fs.existsSync(filePath)) {
      return await sendInjectedHtml(req, res, filePath);
    }
  }
  next();
});

// ─── STATIC FILES ─────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  index: false,
}));

// ─── ROUTES ───────────────────────────────────────────
app.use('/auth', authLimiter, authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/products', productRoutes);
// Apply strict rate limit to public lead-capture submission endpoints BEFORE general API routes
app.use('/api/submissions', submissionLimiter);
app.use('/api/exit-lead', submissionLimiter);
app.use('/send-email', submissionLimiter, contactRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', generalLimiter, apiRoutes);

// ─── SECURE DOWNLOADS ─────────────────────────────────
// /downloads/* requires a valid client JWT UNLESS library_gated is false for free templates
app.use('/downloads', async (req, res, next) => {
  // Define free template paths that are eligible for public access
  const freeTemplates = [
    '/downloads/business-case-template',
    '/downloads/financial-model-template',
    '/downloads/hipaa-compliance-checklist-pack',
    '/downloads/kpi-dashboard-template',
    '/downloads/project-management-framework',
    '/downloads/sop-template-bundle',
    '/downloads/strategic-planning-template'
  ];

  // Check if current request is for a free template
  const normalizedPath = req.path.toLowerCase();
  const isFreeTemplate = freeTemplates.some(t => {
    const base = t.replace('/downloads', '').toLowerCase();
    // Match exact base, base with trailing slash, or any file within that directory
    return normalizedPath === base || 
           normalizedPath === base + '/' || 
           normalizedPath.startsWith(base + '/') ||
           normalizedPath.startsWith(base + '/index.html');
  });

  try {
    // 1. Check if the library is currently gated in the DB
    const db = await getDb();
    const [rows] = await db.execute('SELECT value FROM site_settings WHERE `key` = "library_gated"');
    const isGated = rows.length > 0 ? rows[0].value === '1' : true; 

    // 2. If it's a free template and library is NOT gated, allow it
    if (isFreeTemplate && !isGated) {
      return next();
    }

    // 3. Otherwise, enforce JWT authentication
    const authHeader = req.headers['authorization'];
    const headerToken = authHeader && authHeader.split(' ')[1];
    const queryToken = req.query.auth;
    const token = headerToken || queryToken;

    if (!token) {
      return res.redirect(`/portal-login.html?redirect=${encodeURIComponent(req.originalUrl)}`);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'dev-secret', (err, decoded) => {
      if (err || (decoded.role !== 'client' && decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
        return res.redirect(`/portal-login.html?redirect=${encodeURIComponent(req.originalUrl)}`);
      }
      next();
    });
  } catch (err) {
    console.error('Error in downloads middleware (DB down?):', err.message);
    // FALLBACK: If DB is down, allow access to free templates ONLY
    if (isFreeTemplate) {
      return next();
    }
    res.redirect(`/portal-login.html?redirect=${encodeURIComponent(req.originalUrl)}`);
  }
});

// ─── DYNAMIC ROUTES ───────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const db = await getDb();
    await db.execute('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: e.message });
  }
});

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  const pages = ['/', '/about.html', '/case-studies.html', '/resources.html', '/portal-login.html'];
  const urls = pages.map(p => `  <url><loc>${baseUrl}${p}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('\n');
  res.setHeader('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /login.html\nDisallow: /portal.html\nDisallow: /portal-login.html\nDisallow: /api/\nDisallow: /auth/\nSitemap: ${baseUrl}/sitemap.xml`);
});

// ─── SPA FALLBACK ─────────────────────────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
    return res.status(404).json({ error: 'Not found' });
  }

  const reqPath = req.path === '/' ? 'index.html' : req.path;
  let filePath = path.join(__dirname, '..', 'public', reqPath);

  // If path resolves to a directory, look for index.html inside it
  if (fs.existsSync(filePath)) {
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        if (fs.existsSync(indexPath)) {
          return sendInjectedHtml(req, res, indexPath);
        }
      } else if (filePath.endsWith('.html')) {
        return sendInjectedHtml(req, res, filePath);
      }
    } catch (e) {
      console.error('SPA fallback stat error:', e);
    }
  }

  // Final fallback: serve homepage
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ─── ERROR HANDLER ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── START ────────────────────────────────────────────
// Initialize database before starting server
getDb().catch(err => {
  console.error('❌ DATABASE CONNECTION FAILED:', err.message);
  console.error('Ensure your MySQL credentials are set correctly in .env');
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║   New Level Consultants — Server Running          ║');
  console.log(`║   Local:  http://localhost:${PORT}                    ║`);
  console.log(`║   Admin:  http://localhost:${PORT}/login.html         ║`);
  console.log(`║   Mode:   ${(process.env.NODE_ENV || 'development').padEnd(15)}                 ║`);
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
