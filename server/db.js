const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');

let pool;
let initialized = false;

/**
 * Get the database connection pool (initializes if necessary)
 */
async function getDb() {
  if (!pool) {
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

    if (!config.user || !config.database) {
      console.warn("⚠️ MySQL credentials missing. Ensure DB_USER and DB_NAME are set in .env.");
    }

    pool = mysql.createPool(config);
  }

  if (!initialized) {
    try {
      await initTables();
      await seedAdmins();
      initialized = true;
    } catch (err) {
      console.error("❌ Database Initialization Error:", err.message);
      throw err; // Re-throw so callers know it failed
    }
  }

  return pool;
}

// Helper to handle sqlite-style '?' placeholders vs mysql-style
// mysql2 supports '?' by default.

async function initTables() {
  const db = await pool.getConnection();
  try {
    // Use multi-line backticks carefully — MySQL syntax slightly different (e.g. AUTO_INCREMENT vs AUTOINCREMENT)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL DEFAULT '',
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        organization VARCHAR(255),
        org_size VARCHAR(100),
        industry VARCHAR(255),
        message TEXT,
        contact_method VARCHAR(100) DEFAULT 'Email',
        service_type VARCHAR(255),
        admin_notes TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS exit_leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        source VARCHAR(255),
        notes TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS chat_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price VARCHAR(100) NOT NULL DEFAULT '',
        price_unit VARCHAR(100) NOT NULL DEFAULT 'one-time',
        tags TEXT COMMENT 'JSON array',
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS site_settings (
        \`key\` VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'general',
        label VARCHAR(255) NOT NULL DEFAULT '',
        field_type VARCHAR(100) NOT NULL DEFAULT 'text',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quote TEXT NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        author_role VARCHAR(255) NOT NULL DEFAULT '',
        author_initials VARCHAR(10) NOT NULL DEFAULT '',
        rating INT NOT NULL DEFAULT 5,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS faq_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        last_login DATETIME,
        reset_token VARCHAR(255),
        reset_expires VARCHAR(255),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS client_purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        access_link TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        delivery_type ENUM('download','assessment','course','bundle') NOT NULL DEFAULT 'download',
        delivery_value TEXT COMMENT 'File path, page URL, or comma-separated product_ids for bundles',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS course_enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        product_id VARCHAR(100) NOT NULL,
        progress_json TEXT COMMENT 'JSON object: {moduleId: {completed: bool, score: int}}',
        completed_at DATETIME,
        certificate_issued TINYINT(1) NOT NULL DEFAULT 0,
        enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_email VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(100),
        entity_id INT,
        details TEXT,
        ip_address VARCHAR(100),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // MySQL indices are normally handled explicitly in CREATE TABLE
  } finally {
    db.release();
  }
}

async function seedAdmins() {
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
    const [rows] = await pool.execute('SELECT id FROM admin_users WHERE email = ?', [admin.email]);
    if (rows.length === 0) {
      const hash = bcrypt.hashSync(admin.password, 12);
      await pool.execute(
        'INSERT INTO admin_users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)',
        [admin.email, hash, admin.displayName, admin.role]
      );
      console.log('═══════════════════════════════════════════════════');
      console.log('  ADMIN ACCOUNT CREATED');
      console.log(`  Email:    ${admin.email}`);
      console.log(`  Password: ${admin.password}`);
      console.log(`  Role:     ${admin.role}`);
      console.log('  ⚠️  Change this password immediately via Admin Dashboard');
      console.log('═══════════════════════════════════════════════════');
    }
  }

  // Seed site settings
  const [settings] = await pool.execute('SELECT COUNT(*) as count FROM site_settings');
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
      await pool.execute('INSERT INTO site_settings (\`key\`, value, category, label, field_type) VALUES (?, ?, ?, ?, ?)', s);
    }
  } else {
    // Migration: Update existing settings to the new small business reframing
    const migrations = [
      ['hero_eyebrow', 'Practical Consulting for Small Businesses'],
      ['hero_title', 'Practical <em>consulting</em> for small businesses that mean business.'],
      ['hero_subtitle', 'We help healthcare practices, small businesses, and growing organizations build compliance programs, streamline operations, and implement AI — with clear roadmaps and real results. No enterprise price tag required.'],
    ];
    for (const [key, value] of migrations) {
      await pool.execute('UPDATE site_settings SET value = ? WHERE \`key\` = ?', [value, key]);
    }
  }

  // Seed testimonials
  const [testimonials] = await pool.execute('SELECT COUNT(*) as count FROM testimonials');
  if (testimonials[0].count === 0) {
    const defaultTestimonials = [
      ['New Level Consultants transformed our HIPAA program from reactive to proactive. We passed our first external audit with zero findings — something we had never achieved before.', 'Rachel M.', 'COO, Community Health Center', 'RM', 5, 1],
      ['Their AI automation setup saved our billing team 30+ hours per month. The ROI in the first three months alone justified the entire year\'s retainer cost.', 'Dr. David T.', 'Founder, Telehealth Practice', 'DT', 5, 2],
      ['The Business Health Assessment felt like a $5,000 consulting deliverable for $97. It gave us a precise roadmap that we\'ve been executing against ever since.', 'Sandra J.', 'Executive Director, Nonprofit', 'SJ', 5, 3],
    ];
    for (const t of defaultTestimonials) {
      await pool.execute('INSERT INTO testimonials (quote, author_name, author_role, author_initials, rating, sort_order) VALUES (?, ?, ?, ?, ?, ?)', t);
    }
  }

  // Seed Tier 1 Products
  const [products] = await pool.execute('SELECT COUNT(*) as count FROM products');
  if (products[0].count === 0) {
    const tier1Products = [
      [
        'hipaa-checklist',
        'HIPAA Compliance Checklist Pack',
        '120+ action items, BAA template, staff acknowledgment forms, breach notification checklist, and a risk assessment worksheet — ready to implement immediately.',
        67.00,
        'download',
        '/downloads/hipaa-compliance-checklist-pack'
      ],
      [
        'sop-bundle',
        'SOP Template Bundle',
        '15 ready-to-use Standard Operating Procedure templates covering HR, compliance, operations, and clinical workflows — professionally formatted and fully customizable.',
        97.00,
        'download',
        '/downloads/sop-template-bundle'
      ],
      [
        'bha',
        'Business Health Assessment',
        'Scored questionnaire across 8 business dimensions — compliance, finance, operations, HR, marketing, tech, risk, and growth. Instant branded report with priority action plan.',
        97.00,
        'assessment',
        '/tools/business-health-assessment'
      ],
      [
        'frs',
        'Financial Readiness Score',
        'Form-based assessment of your financial health — cash flow, funding eligibility, credit positioning, burn rate, and investor readiness — with tailored next steps.',
        127.00,
        'assessment',
        '/tools/financial-readiness-score'
      ],
      [
        'compliance-cert',
        'Healthcare Compliance Certification',
        'Self-paced 6-module course covering HIPAA, EHE reporting, Ryan White compliance, risk assessment methodology, breach response, and audit readiness. Certificate included.',
        297.00,
        'course',
        'compliance-cert'
      ],
      [
        'bundle-tier1',
        'All-in-One Tier 1 Toolkit',
        'Every Tier 1 digital product in one purchase: HIPAA Checklist Pack, SOP Template Bundle, Business Health Assessment, Financial Readiness Score, and Healthcare Compliance Certification. Save $338.',
        347.00,
        'bundle',
        'hipaa-checklist,sop-bundle,bha,frs,compliance-cert'
      ],
    ];
    for (const p of tier1Products) {
      await pool.execute(
        'INSERT INTO products (product_id, name, description, price, delivery_type, delivery_value) VALUES (?, ?, ?, ?, ?, ?)',
        p
      );
    }
  }

  // Seed FAQs
  const [faqs] = await pool.execute('SELECT COUNT(*) as count FROM faq_items');
  if (faqs[0].count === 0) {
    const defaultFAQs = [
      ['How quickly can I get started?', 'Productized tools are instant or 24-hour delivery. Retainer plans and à la carte projects onboard within 3–5 business days of your first call.', 1],
      ['Do you work with organizations outside of healthcare?', 'Yes. While we specialize in healthcare, our compliance, operations, AI, and business development services serve nonprofits, legal practices, and mid-size businesses across industries.', 2],
      ['Can I cancel a retainer plan at any time?', 'Monthly retainers can be cancelled with 30 days notice. Annual plans include a prorated refund policy after month 3. We never trap clients in long-term contracts.', 3],
      ['Are the automated reports HIPAA-compliant?', 'Our productized tools are designed with data minimization and do not collect or store PHI. For services requiring PHI handling, we operate under a signed Business Associate Agreement (BAA).', 4],
      ["What's included in the free consultation?", 'A 20-minute call with a senior consultant to understand your goals, identify your most pressing challenges, and recommend the right starting point — with zero sales pressure.', 5],
      ['Do you offer nonprofit or multi-location discounts?', 'Yes. Qualified 501(c)(3) organizations receive 10% off retainer plans and 15% off à la carte projects. Multi-location enterprises get custom pricing. Contact us to verify eligibility.', 6],
    ];
    for (const f of defaultFAQs) {
      await pool.execute('INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)', f);
    }
  }
}

module.exports = { getDb };
