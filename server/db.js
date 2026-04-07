const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'nlcfirm.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
    seedAdmins();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'admin',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      organization TEXT,
      org_size TEXT,
      industry TEXT,
      message TEXT,
      contact_method TEXT DEFAULT 'Email',
      service_type TEXT,
      admin_notes TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exit_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Services catalog managed by admin
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price TEXT NOT NULL DEFAULT '',
      price_unit TEXT NOT NULL DEFAULT 'one-time',
      tags TEXT DEFAULT '[]',
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Site settings (key/value store for editable content)
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'general',
      label TEXT NOT NULL DEFAULT '',
      field_type TEXT NOT NULL DEFAULT 'text',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Testimonials managed by admin
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL DEFAULT '',
      author_initials TEXT NOT NULL DEFAULT '',
      rating INTEGER NOT NULL DEFAULT 5,
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- FAQ items managed by admin
    CREATE TABLE IF NOT EXISTS faq_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Client Portal tables
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login TEXT,
      reset_token TEXT,
      reset_expires TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS client_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      access_link TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS client_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      plan_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      next_billing_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    -- Audit log for admin activity tracking
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_email TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
    CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at);
    CREATE INDEX IF NOT EXISTS idx_exit_leads_email ON exit_leads(email);
    CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
    CREATE INDEX IF NOT EXISTS idx_services_visible ON services(is_visible);
    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
    CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
    CREATE INDEX IF NOT EXISTS idx_client_purchases_client ON client_purchases(client_id);
    CREATE INDEX IF NOT EXISTS idx_client_subs_client ON client_subscriptions(client_id);
  `);

  // Add columns if they don't exist (safe migration for existing DBs)
  const cols = db.prepare("PRAGMA table_info(admin_users)").all().map(c => c.name);
  if (!cols.includes('display_name')) {
    db.exec("ALTER TABLE admin_users ADD COLUMN display_name TEXT NOT NULL DEFAULT ''");
  }
  if (!cols.includes('is_active')) {
    db.exec("ALTER TABLE admin_users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1");
  }
  if (!cols.includes('last_login')) {
    db.exec("ALTER TABLE admin_users ADD COLUMN last_login TEXT");
  }
  const subCols = db.prepare("PRAGMA table_info(submissions)").all().map(c => c.name);
  if (!subCols.includes('admin_notes')) {
    db.exec("ALTER TABLE submissions ADD COLUMN admin_notes TEXT");
  }
}

function seedAdmins() {
  const admins = [
    {
      email: process.env.ADMIN_EMAIL || 'pierre@nlcfirm.com',
      password: process.env.ADMIN_DEFAULT_PASSWORD || 'NLC@dmin2026!Secure',
      displayName: 'Pierre',
      role: 'super_admin',
    },
    {
      email: 'info@nlcfirm.com',
      password: process.env.ADMIN2_DEFAULT_PASSWORD || 'NLCInfo@2026!Secure',
      displayName: 'NLC Admin',
      role: 'admin',
    },
  ];

  for (const admin of admins) {
    const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(admin.email);
    if (!existing) {
      const hash = bcrypt.hashSync(admin.password, 12);
      db.prepare(
        'INSERT INTO admin_users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)'
      ).run(admin.email, hash, admin.displayName, admin.role);
      console.log('═══════════════════════════════════════════════════');
      console.log('  ADMIN ACCOUNT CREATED');
      console.log(`  Email:    ${admin.email}`);
      console.log(`  Password: ${admin.password}`);
      console.log(`  Role:     ${admin.role}`);
      console.log('  ⚠️  Change this password immediately via Admin Dashboard');
      console.log('═══════════════════════════════════════════════════');
    }
  }

  // Seed default site settings if empty
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get().count;
  if (settingsCount === 0) {
    const defaults = [
      ['hero_eyebrow', 'Healthcare & Business Consulting', 'hero', 'Hero Eyebrow Text', 'text'],
      ['hero_title', 'Elevate Every<br><em>Level</em> of Your<br>Organization', 'hero', 'Hero Title (HTML allowed)', 'textarea'],
      ['hero_subtitle', 'From compliance and operations to AI automation and growth — we deliver consulting, productized tools, and strategic partnerships that create measurable impact with minimal overhead.', 'hero', 'Hero Subtitle', 'textarea'],
      ['company_phone', '(800) 555-1234', 'contact', 'Phone Number', 'text'],
      ['company_email', 'info@nlcfirm.com', 'contact', 'Contact Email', 'text'],
      ['footer_tagline', 'Healthcare and business consulting for organizations that refuse to stay at the same level. Compliance, operations, technology, and growth — all under one roof.', 'footer', 'Footer Tagline', 'textarea'],
      ['trust_badge_1', '🛡️ HIPAA Compliant', 'trust', 'Trust Badge 1', 'text'],
      ['trust_badge_2', '⭐ 4.9/5 Client Rating', 'trust', 'Trust Badge 2', 'text'],
      ['trust_badge_3', '🏆 200+ Organizations Served', 'trust', 'Trust Badge 3', 'text'],
      ['trust_badge_4', '🔒 SOC 2 Ready', 'trust', 'Trust Badge 4', 'text'],
      ['trust_badge_5', '💯 30-Day Money-Back Guarantee', 'trust', 'Trust Badge 5', 'text'],
      ['cta_heading', 'Start at Any Level.<br><em>Grow Without Limits.</em>', 'cta', 'CTA Section Heading', 'textarea'],
      ['cta_body', 'Whether you start with a $97 self-serve tool today or explore a full strategic partnership — every client gets a clear, results-oriented plan from day one.', 'cta', 'CTA Section Body', 'textarea'],
      ['meta_title', 'New Level Consultants | Healthcare & Business Consulting | HIPAA, Compliance, AI Automation', 'seo', 'Meta Title', 'text'],
      ['meta_description', 'New Level Consultants delivers healthcare consulting, HIPAA compliance, AI automation, and business growth strategies. Retainer plans from $797/mo. Instant tools from $67. Book a free discovery call today.', 'seo', 'Meta Description', 'textarea'],
    ];

    const stmt = db.prepare('INSERT INTO site_settings (key, value, category, label, field_type) VALUES (?, ?, ?, ?, ?)');
    for (const s of defaults) {
      stmt.run(...s);
    }
  }

  // Seed default testimonials if empty
  const testimonialsCount = db.prepare('SELECT COUNT(*) as count FROM testimonials').get().count;
  if (testimonialsCount === 0) {
    const defaultTestimonials = [
      ['New Level Consultants transformed our HIPAA program from reactive to proactive. We passed our first external audit with zero findings — something we had never achieved before.', 'Rachel M.', 'COO, Community Health Center', 'RM', 5, 1],
      ['Their AI automation setup saved our billing team 30+ hours per month. The ROI in the first three months alone justified the entire year\'s retainer cost.', 'Dr. David T.', 'Founder, Telehealth Practice', 'DT', 5, 2],
      ['The Business Health Assessment felt like a $5,000 consulting deliverable for $97. It gave us a precise roadmap that we\'ve been executing against ever since.', 'Sandra J.', 'Executive Director, Nonprofit', 'SJ', 5, 3],
    ];
    const tStmt = db.prepare('INSERT INTO testimonials (quote, author_name, author_role, author_initials, rating, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    for (const t of defaultTestimonials) {
      tStmt.run(...t);
    }
  }

  // Seed default FAQ items if empty
  const faqCount = db.prepare('SELECT COUNT(*) as count FROM faq_items').get().count;
  if (faqCount === 0) {
    const defaultFAQs = [
      ['How quickly can I get started?', 'Productized tools are instant or 24-hour delivery. Retainer plans and à la carte projects onboard within 3–5 business days of your first call.', 1],
      ['Do you work with organizations outside of healthcare?', 'Yes. While we specialize in healthcare, our compliance, operations, AI, and business development services serve nonprofits, legal practices, and mid-size businesses across industries.', 2],
      ['Can I cancel a retainer plan at any time?', 'Monthly retainers can be cancelled with 30 days notice. Annual plans include a prorated refund policy after month 3. We never trap clients in long-term contracts.', 3],
      ['Are the automated reports HIPAA-compliant?', 'Our productized tools are designed with data minimization and do not collect or store PHI. For services requiring PHI handling, we operate under a signed Business Associate Agreement (BAA).', 4],
      ["What's included in the free consultation?", 'A 20-minute call with a senior consultant to understand your goals, identify your most pressing challenges, and recommend the right starting point — with zero sales pressure.', 5],
      ['Do you offer nonprofit or multi-location discounts?', 'Yes. Qualified 501(c)(3) organizations receive 10% off retainer plans and 15% off à la carte projects. Multi-location enterprises get custom pricing. Contact us to verify eligibility.', 6],
    ];
    const fStmt = db.prepare('INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)');
    for (const f of defaultFAQs) {
      fStmt.run(...f);
    }
  }
}

module.exports = { getDb };
