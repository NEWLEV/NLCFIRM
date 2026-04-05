require('dotenv').config();

const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const clientRoutes = require('./routes/client'); // Added this line
const paymentRoutes = require('./routes/payments');
const { getDb } = require('./db');

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

// ─── STATIC FILES ─────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
}));

// ─── ROUTES ───────────────────────────────────────────
app.use('/auth', authLimiter, authRoutes);
app.use('/api/client', clientRoutes);
// Apply strict rate limit to public lead-capture submission endpoints BEFORE general API routes
app.use('/api/submissions', submissionLimiter);
app.use('/api/exit-lead', submissionLimiter);
app.use('/api/payments', paymentRoutes);
app.use('/api', generalLimiter, apiRoutes);

// ─── DYNAMIC ROUTES ───────────────────────────────────
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
// Serve index.html for any non-API, non-file route
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ─── ERROR HANDLER ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── START ────────────────────────────────────────────
// Initialize database before starting server
getDb().then(() => {
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
}).catch(err => {
  console.error('FATAL: Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;
