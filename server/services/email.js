'use strict';

const nodemailer = require('nodemailer');

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const SMTP_CONFIG = {
  host:   process.env.SMTP_HOST || 'smtp.hostinger.com',
  port:   parseInt(process.env.SMTP_PORT, 10) || 465,
  secure: true, // Hostinger port 465 requires SSL — always true
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Timeouts to prevent hanging requests
  connectionTimeout: 10000,
  greetingTimeout:   10000,
  socketTimeout:     15000,
};

// Detect if SMTP is properly configured (both user AND a real password)
const PLACEHOLDER = 'ENTER_YOUR_HOSTINGER_EMAIL_PASSWORD_HERE';
const isConfigured =
  !!SMTP_CONFIG.auth.user &&
  !!SMTP_CONFIG.auth.pass &&
  SMTP_CONFIG.auth.pass !== PLACEHOLDER;

// FROM address — use env value directly; it is already a valid RFC 5322 address
const DEFAULT_FROM = process.env.SMTP_FROM || `"New Level Consultants" <${SMTP_CONFIG.auth.user || 'info@nlcfirm.com'}>`;
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL || 'info@nlcfirm.com';

// ─── TRANSPORTER ─────────────────────────────────────────────────────────────
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

// Verify connection on startup (non-blocking, for logging only)
if (isConfigured) {
  getTransporter().verify((err) => {
    if (err) {
      console.error('❌ SMTP Connection Failed:', err.message);
      console.error('   Host:', SMTP_CONFIG.host);
      console.error('   Port:', SMTP_CONFIG.port);
      console.error('   User:', SMTP_CONFIG.auth.user);
    } else {
      console.log('✅ SMTP Ready — emails will be sent via', SMTP_CONFIG.host);
    }
  });
} else {
  console.warn('⚠️  SMTP not configured — emails will be logged to console only.');
  if (!SMTP_CONFIG.auth.user) console.warn('   Missing: SMTP_USER');
  if (!SMTP_CONFIG.auth.pass || SMTP_CONFIG.auth.pass === PLACEHOLDER) console.warn('   Missing: SMTP_PASS (still set to placeholder)');
}

// ─── CORE SEND FUNCTION ───────────────────────────────────────────────────────
/**
 * Sends a generic email.
 * @returns {Promise<boolean>} true on success, false on failure
 */
async function sendEmail({ to, subject, text, html }) {
  if (!isConfigured) {
    // Mock — log to console so you can still see it during development
    console.log('─────────────────────────────────────');
    console.log('[Email Mock] SMTP not configured — would have sent:');
    console.log('  To:     ', to);
    console.log('  Subject:', subject);
    console.log('─────────────────────────────────────');
    return true;
  }

  try {
    const info = await getTransporter().sendMail({
      from:    DEFAULT_FROM,
      to,
      subject,
      text:    text || subject,
      html,
    });
    console.log(`✅ Email sent to ${to} | MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Email send failed to ${to}:`, error.message);
    return false;
  }
}

// ─── BRANDED EMAIL TEMPLATES ─────────────────────────────────────────────────
function wrapTemplate(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #0c1628; padding: 24px 32px; text-align: center; }
    .header img { height: 40px; }
    .header-title { color: #c9a84c; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; }
    .body { padding: 32px; color: #374151; line-height: 1.7; }
    .body h2 { color: #0c1628; font-size: 22px; margin-top: 0; }
    .body p { margin: 0 0 16px; }
    .btn { display: inline-block; background: #c9a84c; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; margin: 8px 0; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
    .highlight { background: #fef9ec; border-left: 4px solid #c9a84c; padding: 12px 16px; border-radius: 0 4px 4px 0; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="color:#c9a84c;font-size:20px;font-weight:700;letter-spacing:1px;">NEW LEVEL CONSULTANTS</div>
      <div class="header-title">Healthcare &amp; Business Consulting</div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>New Level Consultants · info@nlcfirm.com · 786-408-4243</p>
      <p>© 2026 New Level Consultants. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── OUTBOUND EMAIL FUNCTIONS ────────────────────────────────────────────────

/**
 * Notify admin of a new form submission/lead
 */
async function notifyAdminNewLead(leadDetails) {
  const subject = `New Lead: ${leadDetails.firstName} ${leadDetails.lastName}`;
  const html = wrapTemplate(`
    <h2>📬 New Website Lead</h2>
    <div class="highlight">
      <strong>${leadDetails.firstName} ${leadDetails.lastName}</strong> submitted a form on nlcfirm.com.
    </div>
    <p><strong>Email:</strong> <a href="mailto:${leadDetails.email}">${leadDetails.email}</a></p>
    <p><strong>Organization:</strong> ${leadDetails.organization || 'N/A'}</p>
    <p><strong>Service Interest:</strong> ${leadDetails.serviceType || 'N/A'}</p>
    <p><strong>Message:</strong><br>${leadDetails.message || 'N/A'}</p>
    <div class="divider"></div>
    <a href="https://nlcfirm.com/login.html" class="btn">View in Admin Dashboard →</a>
  `);
  return sendEmail({ to: ADMIN_EMAIL, subject, html });
}

/**
 * Send HIPAA checklist email to a lead who submitted the exit popup
 */
async function sendChecklistEmail(leadEmail) {
  const subject = `Your Free HIPAA Quick-Start Checklist from New Level Consultants`;
  const html = wrapTemplate(`
    <h2>Here's Your Free HIPAA Checklist! 🛡️</h2>
    <p>Thank you for your interest in New Level Consultants. As promised, here is your free HIPAA Quick-Start Checklist.</p>
    <div class="highlight">
      Click below to download your <strong>25-Point HIPAA Compliance Checklist</strong> — no login required.
    </div>
    <a href="https://nlcfirm.com/downloads/hipaa-compliance-checklist-pack" class="btn">Download Your Free Checklist →</a>
    <div class="divider"></div>
    <p>Need help implementing your HIPAA program? We offer:</p>
    <ul>
      <li><strong>HIPAA Compliance Program Setup</strong> — fully implemented in 30 days ($1,200)</li>
      <li><strong>Growth Retainer</strong> — ongoing compliance + consulting ($1,497/mo)</li>
    </ul>
    <a href="https://nlcfirm.com/#plans" class="btn" style="background:#0c1628;">View Our Plans →</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#6b7280;">You received this because you requested our free checklist at nlcfirm.com. No spam — ever.</p>
  `);
  return sendEmail({ to: leadEmail, subject, html });
}

/**
 * Send welcome email to a new client after portal account creation
 */
async function sendClientWelcome(clientName, clientEmail) {
  const subject = `Welcome to NLC Firm — Your Client Portal is Ready`;
  const html = wrapTemplate(`
    <h2>Welcome to New Level Consultants, ${clientName}! 🎉</h2>
    <p>Your Client Portal account has been created. You can now access all of your purchased tools, courses, and resources.</p>
    <div class="highlight">
      <strong>Your portal is live and ready.</strong> Log in to access your content.
    </div>
    <a href="https://nlcfirm.com/portal-login.html" class="btn">Access Your Client Portal →</a>
    <div class="divider"></div>
    <p>If you have any questions, simply reply to this email — we respond within 1 business day.</p>
    <p>— The NLC Firm Team</p>
  `);
  return sendEmail({ to: clientEmail, subject, html });
}

/**
 * Send password reset email to a client
 */
async function sendPasswordReset(clientEmail, resetLink) {
  const subject = `Reset Your NLC Firm Password`;
  const html = wrapTemplate(`
    <h2>Password Reset Request 🔒</h2>
    <p>We received a request to reset your password for the NLC Firm Client Portal.</p>
    <div class="highlight">
      This link will expire in <strong>1 hour</strong>.
    </div>
    <a href="${resetLink}" class="btn">Reset My Password →</a>
    <div class="divider"></div>
    <p>If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
  `);
  return sendEmail({ to: clientEmail, subject, html });
}

module.exports = {
  sendEmail,
  notifyAdminNewLead,
  sendChecklistEmail,
  sendClientWelcome,
  sendPasswordReset,
};
