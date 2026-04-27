'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendEmail } = require('../services/email');

const router = express.Router();

// ─── HONEYPOT + SANITIZATION HELPERS ─────────────────────────────────────────

/**
 * Strip HTML tags from a string to prevent XSS in email bodies.
 */
function stripHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

// ─── POST /send-email ────────────────────────────────────────────────────────
router.post(
  '/',
  [
    // Validation & sanitization
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 120 }).withMessage('Name must be under 120 characters')
      .escape(),
    body('email')
      .isEmail().withMessage('A valid email address is required')
      .normalizeEmail(),
    body('subject')
      .trim()
      .notEmpty().withMessage('Subject is required')
      .isLength({ max: 200 }).withMessage('Subject must be under 200 characters')
      .escape(),
    body('message')
      .trim()
      .notEmpty().withMessage('Message is required')
      .isLength({ max: 5000 }).withMessage('Message must be under 5,000 characters')
      .escape(),
  ],
  async (req, res) => {
    // ── Honeypot check ──────────────────────────────────
    // If the hidden "_gotcha" field is filled, it's a bot — silently succeed
    if (req.body._gotcha) {
      return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    }

    // ── Validation errors ───────────────────────────────
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please fix the following errors.',
        errors: errors.array().map(e => e.msg),
      });
    }

    const { name, email, subject, message } = req.body;

    // Extra server-side sanitization
    const cleanName    = stripHtml(name);
    const cleanSubject = stripHtml(subject);
    const cleanMessage = stripHtml(message);

    // ── Build the email ─────────────────────────────────
    const adminTo = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'info@nlcfirm.com';

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #0c1628; padding: 24px 32px; text-align: center; }
    .header-title { color: #c9a84c; font-size: 20px; font-weight: 700; letter-spacing: 1px; }
    .header-sub { color: #c9a84c; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px; }
    .body { padding: 32px; color: #374151; line-height: 1.7; }
    .body h2 { color: #0c1628; font-size: 20px; margin-top: 0; }
    .highlight { background: #fef9ec; border-left: 4px solid #c9a84c; padding: 14px 18px; border-radius: 0 4px 4px 0; margin: 18px 0; }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .label { font-weight: 600; color: #0c1628; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-title">NEW LEVEL CONSULTANTS</div>
      <div class="header-sub">Contact Form Submission</div>
    </div>
    <div class="body">
      <h2>📬 New Contact Message</h2>
      <div class="highlight">
        <strong>${cleanName}</strong> submitted the contact form on nlcfirm.com.
      </div>
      <p><span class="label">From:</span> ${cleanName} &lt;${email}&gt;</p>
      <p><span class="label">Subject:</span> ${cleanSubject}</p>
      <div class="divider"></div>
      <p><span class="label">Message:</span></p>
      <p>${cleanMessage.replace(/\n/g, '<br>')}</p>
    </div>
    <div class="footer">
      <p>New Level Consultants · info@nlcfirm.com · 786-408-4243</p>
      <p>© ${new Date().getFullYear()} New Level Consultants. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    const plainText = `New Contact Form Submission\n\nFrom: ${cleanName} <${email}>\nSubject: ${cleanSubject}\n\nMessage:\n${cleanMessage}`;

    try {
      const sent = await sendEmail({
        to: adminTo,
        subject: `Contact Form: ${cleanSubject}`,
        text: plainText,
        html: htmlBody,
        replyTo: email,  // So the admin can reply directly to the sender
      });

      if (sent) {
        console.log(`✅ Contact form email sent — from: ${email}, subject: ${cleanSubject}`);
        return res.status(200).json({ success: true, message: 'Your message has been sent. We\'ll be in touch within 1 business day!' });
      } else {
        console.error(`❌ Contact form email failed — from: ${email}`);
        return res.status(500).json({ success: false, message: 'There was a problem sending your message. Please try again or call us at 786-408-4243.' });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
  }
);

module.exports = router;
