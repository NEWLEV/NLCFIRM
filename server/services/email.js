const nodemailer = require('nodemailer');

// Initialize the Nodemailer transporter using environment variables.
// Users can provide these in .env (e.g., SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_USER, SMTP_PASS)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const DEFAULT_FROM = `"NLCFirm Notification" <${process.env.SMTP_FROM || 'noreply@nlcfirm.com'}>`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@nlcfirm.com';

/**
 * Sends a generic email
 */
async function sendEmail({ to, subject, text, html }) {
  try {
    if (!process.env.SMTP_USER) {
      console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
      return true; // Mock success if SMTP is not configured yet
    }

    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Sends a notification to the Admins that a new form was submitted
 */
async function notifyAdminNewLead(leadDetails) {
  const subject = `New Website Lead: ${leadDetails.firstName} ${leadDetails.lastName}`;
  const html = `
    <h2>You have a new lead from NLCFirm.com</h2>
    <p><strong>Name:</strong> ${leadDetails.firstName} ${leadDetails.lastName}</p>
    <p><strong>Email:</strong> ${leadDetails.email}</p>
    <p><strong>Organization:</strong> ${leadDetails.organization || 'N/A'}</p>
    <p><strong>Service Type:</strong> ${leadDetails.serviceType || 'N/A'}</p>
    <p><strong>Message:</strong> ${leadDetails.message || 'N/A'}</p>
    <br>
    <p>Log in to the <a href="https://nlcfirm.com/login.html">Admin Dashboard</a> to manage this lead.</p>
  `;
  return sendEmail({ to: ADMIN_EMAIL, subject, html });
}

/**
 * Sends a welcome email to new clients
 */
async function sendClientWelcome(clientName, clientEmail) {
  const subject = `Welcome to the NLC Firm Client Portal!`;
  const html = `
    <h2>Welcome to New Level Consultants, ${clientName}!</h2>
    <p>Your Client Portal account has been successfully created.</p>
    <p>You can now log in at any time to access your purchased digital tools, courses, and retainer subscriptions.</p>
    <p><strong>Login URL:</strong> <a href="https://nlcfirm.com/portal-login.html">https://nlcfirm.com/portal-login.html</a></p>
    <br>
    <p>If you have any questions, please reply directly to this email.</p>
    <p>- The NLC Firm Team</p>
  `;
  return sendEmail({ to: clientEmail, subject, html });
}

/**
 * Sends a password reset email to clients
 */
async function sendPasswordReset(clientEmail, resetLink) {
  const subject = `Password Reset Request - NLC Firm`;
  const html = `
    <p>We received a request to reset your password for the NLC Firm Client Portal.</p>
    <p>Click the link below to reset it. This link will expire in 1 hour.</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <br>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
  `;
  return sendEmail({ to: clientEmail, subject, html });
}

/**
 * Sends the HIPAA Quick-Start Checklist to a new lead
 */
async function sendChecklistEmail(leadEmail) {
  const subject = `Your HIPAA Quick-Start Checklist is Here!`;
  const html = `
    <h2>Welcome to New Level Consultants!</h2>
    <p>Thank you for requesting our HIPAA Quick-Start Checklist.</p>
    <p>You can download your free 25-point checklist using the link below:</p>
    <p><a href="https://nlcfirm.com/downloads/hipaa-compliance-checklist-pack">Download HIPAA Checklist</a></p>
    <br>
    <p>If you have any questions or need further assistance with your compliance program, feel free to reply directly to this email or book a free discovery call on our website.</p>
    <p>- The NLC Firm Team</p>
  `;
  return sendEmail({ to: leadEmail, subject, html });
}

module.exports = {
  sendEmail,
  notifyAdminNewLead,
  sendClientWelcome,
  sendPasswordReset,
  sendChecklistEmail
};
