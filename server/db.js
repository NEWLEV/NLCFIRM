const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

let sqlite3;
try {
  sqlite3 = require('sqlite3').verbose();
} catch (e) {
  // SQLite not available in this environment (likely production)
}

let pool;
let sqliteDb;
let initialized = false;
let dbType = 'mysql'; // 'mysql' or 'sqlite'

/**
 * Get a database connection (MySQL or SQLite fallback)
 */
async function getDb() {
  if (pool) return pool;
  if (sqliteDb) return sqliteDb;

  // Try MySQL first
  const config = {
    host: (!process.env.DB_HOST || process.env.DB_HOST === 'localhost') ? '127.0.0.1' : process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };

  try {
    if (!config.user || !config.database) {
      throw new Error("MySQL credentials missing");
    }
    
    const tempPool = mysql.createPool(config);
    // Test connection
    await tempPool.execute('SELECT 1');
    pool = tempPool;
    dbType = 'mysql';
    console.log('✅ Connected to MySQL Database');
  } catch (err) {
    if (!sqlite3) {
      console.error(`❌ MySQL Connection Failed: ${err.message}`);
      console.error('❌ SQLite fallback is not available in this environment.');
      throw err;
    }

    console.warn(`⚠️ MySQL Connection Failed: ${err.message}. Falling back to SQLite...`);
    
    // Fallback to SQLite
    const dbPath = path.join(__dirname, '..', 'nlcfirm.db');
    sqliteDb = new sqlite3.Database(dbPath);
    dbType = 'sqlite';
    
    // Add a promise-based execute wrapper to sqliteDb to match mysql2 API
    sqliteDb.execute = (sql, params = []) => {
      // Convert MySQL style placeholders (?) if needed (sqlite3 uses ? too)
      // Convert MySQL-specific syntax (e.g. `NOW()`) to SQLite (e.g. `CURRENT_TIMESTAMP`)
      let translatedSql = sql
        .replace(/NOW\(\)/g, "datetime('now')")
        .replace(/DATE_SUB\(NOW\(\), INTERVAL 30 DAY\)/g, "datetime('now', '-30 days')")
        .replace(/TINYINT\(1\)/g, "INTEGER")
        .replace(/AUTO_INCREMENT/g, "AUTOINCREMENT")
        .replace(/ON UPDATE CURRENT_TIMESTAMP/g, "");

      return new Promise((resolve, reject) => {
        const isSelect = translatedSql.trim().toUpperCase().startsWith('SELECT');
        if (isSelect) {
          sqliteDb.all(translatedSql, params, (err, rows) => {
            if (err) reject(err);
            else resolve([rows]);
          });
        } else {
          sqliteDb.run(translatedSql, params, function(err) {
            if (err) reject(err);
            else resolve([{ affectedRows: this.changes, insertId: this.lastID }]);
          });
        }
      });
    };

    // Mock getConnection for transactions if needed
    sqliteDb.getConnection = async () => ({
      execute: sqliteDb.execute,
      beginTransaction: async () => sqliteDb.execute('BEGIN TRANSACTION'),
      commit: async () => sqliteDb.execute('COMMIT'),
      rollback: async () => sqliteDb.execute('ROLLBACK'),
      release: () => {}
    });

    console.log('✅ Connected to SQLite Database (nlcfirm.db)');
  }

  if (!initialized) {
    try {
      await initTables();
      await seedAdmins();
      initialized = true;
    } catch (err) {
      console.error("❌ Database Initialization Error:", err.message);
      throw err;
    }
  }

  return pool || sqliteDb;
}

async function initTables() {
  const db = pool || sqliteDb;
  
  // Create tables using SQLite-compatible syntax (MySQL also accepts most of this)
  const tables = [
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'admin',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
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
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS exit_leads (
      id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      email TEXT NOT NULL,
      source TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS chat_logs (
      id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price TEXT NOT NULL DEFAULT '',
      price_unit TEXT NOT NULL DEFAULT 'one-time',
      tags TEXT,
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS site_settings (
      "key" TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      label TEXT NOT NULL DEFAULT '',
      field_type TEXT NOT NULL DEFAULT 'text',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      quote TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL DEFAULT '',
      author_initials TEXT NOT NULL DEFAULT '',
      rating INTEGER NOT NULL DEFAULT 5,
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS faq_items (
      id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
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
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS client_purchases (
      id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      client_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      access_link TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      purchased_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      product_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      delivery_type TEXT NOT NULL DEFAULT 'download',
      delivery_value TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY ${dbType === 'mysql' ? 'AUTO_INCREMENT' : 'AUTOINCREMENT'},
      user_id INTEGER,
      user_email TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tables) {
    await db.execute(sql);
  }
}

async function seedAdmins() {
  const db = pool || sqliteDb;
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
    const [rows] = await db.execute('SELECT id FROM admin_users WHERE email = ?', [admin.email]);
    if (rows.length === 0) {
      const hash = bcrypt.hashSync(admin.password, 12);
      await db.execute(
        'INSERT INTO admin_users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)',
        [admin.email, hash, admin.displayName, admin.role]
      );
    }
  }

  // Seed site settings
  const [settings] = await db.execute('SELECT COUNT(*) as count FROM site_settings');
  if (settings[0].count === 0) {
    const defaults = [
      ['hero_eyebrow', 'Practical Consulting for Small Businesses', 'hero', 'Hero Eyebrow Text', 'text'],
      ['hero_title', 'Practical <em>consulting</em> for small businesses that mean business.', 'hero', 'Hero Title (HTML allowed)', 'textarea'],
      ['hero_subtitle', 'We help healthcare practices, small businesses, and growing organizations build compliance programs, streamline operations, and implement AI — with clear roadmaps and real results. No enterprise price tag required.', 'hero', 'Hero Subtitle', 'textarea'],
      ['company_phone', '786-408-4243', 'contact', 'Phone Number', 'text'],
      ['company_email', 'info@nlcfirm.com', 'contact', 'Contact Email', 'text'],
      ['footer_tagline', 'Healthcare and small business consulting for organizations that refuse to stay at the same level. Compliance, operations, technology, and growth — all under one roof.', 'footer', 'Footer Tagline', 'textarea'],
      ['trust_badge_1', '🛡️ HIPAA Compliant', 'trust', 'Trust Badge 1', 'text'],
      ['trust_badge_2', '⭐ 4.9/5 Client Rating', 'trust', 'Trust Badge 2', 'text'],
      ['trust_badge_3', '🏆 200+ Organizations Served', 'trust', 'Trust Badge 3', 'text'],
      ['trust_badge_4', '🔒 SOC 2 Ready', 'trust', 'Trust Badge 4', 'text'],
      ['trust_badge_5', '💯 30-Day Money-Back Guarantee', 'trust', 'Trust Badge 5', 'text'],
      ['cta_heading', 'Start at Any Level.<br><em>Grow Without Limits.</em>', 'cta', 'CTA Section Heading', 'textarea'],
      ['cta_body', 'Whether you start with a $97 self-serve tool today or explore a full strategic partnership — every client gets a clear, results-oriented plan from day one.', 'cta', 'CTA Section Body', 'textarea'],
      ['meta_title', 'New Level Consultants | Healthcare & Business Consulting | HIPAA, Compliance, AI Automation', 'seo', 'Meta Title', 'text'],
      ['meta_description', 'New Level Consultants delivers healthcare consulting, HIPAA compliance, AI automation, and business growth strategies. Retainer plans from $797/mo. Instant tools from $67. Book a free discovery call today.', 'seo', 'Meta Description', 'textarea'],
      ['banner_enabled', '1', 'banner', 'Show Announcement Banner', 'toggle'],
      ['banner_text', '🚀 Q2 Strategy Open: 3 slots remaining for full strategic partnership.', 'banner', 'Banner Text', 'text'],
      ['banner_link', '/#contact', 'banner', 'Banner Link', 'text'],
      ['banner_color', '#0f1724', 'banner', 'Banner Background Color', 'text'],
      ['library_gated', '0', 'system', 'Require Login for Free Library', 'toggle'],
    ];

    for (const s of defaults) {
      await db.execute('INSERT INTO site_settings ("key", value, category, label, field_type) VALUES (?, ?, ?, ?, ?)', s);
    }
  }
}

module.exports = { getDb };
