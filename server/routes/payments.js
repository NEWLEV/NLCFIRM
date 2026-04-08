const express = require('express');
const { getDb } = require('../db');
const { sendEmail } = require('../services/email');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Grant a single product to a client and return a user-facing access record.
 */
async function grantProductAccess(db, clientId, product) {
  let accessLink = null;

  if (product.delivery_type === 'download') {
    // Secure download URL with signed token valid 72 hrs
    const token = crypto.createHmac('sha256', process.env.JWT_SECRET || 'nlc-dl-secret')
      .update(`${clientId}:${product.product_id}:${Date.now()}`)
      .digest('hex')
      .slice(0, 32);
    accessLink = `${product.delivery_value}?token=${token}&cid=${clientId}`;
  } else if (product.delivery_type === 'assessment') {
    accessLink = `${product.delivery_value}?cid=${clientId}`;
  } else if (product.delivery_type === 'course') {
    // Create or refresh course enrollment
    const [existing] = await db.execute(
      'SELECT id FROM course_enrollments WHERE client_id = ? AND product_id = ?',
      [clientId, product.product_id]
    );
    if (existing.length === 0) {
      await db.execute(
        'INSERT INTO course_enrollments (client_id, product_id, progress_json) VALUES (?, ?, ?)',
        [clientId, product.product_id, JSON.stringify({})]
      );
    }
    accessLink = `/portal.html#courses`;
  }

  // Upsert into client_purchases (avoid duplicates)
  const [existingPurchase] = await db.execute(
    'SELECT id FROM client_purchases WHERE client_id = ? AND product_id = ?',
    [clientId, product.product_id]
  );
  if (existingPurchase.length === 0) {
    await db.execute(
      'INSERT INTO client_purchases (client_id, product_id, product_name, access_link) VALUES (?, ?, ?, ?)',
      [clientId, product.product_id, product.name, accessLink]
    );
  } else {
    // Update access link in case it changed
    await db.execute(
      'UPDATE client_purchases SET access_link = ? WHERE client_id = ? AND product_id = ?',
      [accessLink, clientId, product.product_id]
    );
  }

  return { product, accessLink };
}

/**
 * Build a rich HTML purchase confirmation email.
 */
function buildConfirmationEmail(firstName, grants, isNewClient, tempPassword) {
  const productRows = grants.map(g => {
    let deliveryNote = '';
    if (g.product.delivery_type === 'download') {
      deliveryNote = `<p style="margin:0 0 4px 0;">📥 <strong>Download Link:</strong> <a href="https://nlcfirm.com${g.accessLink}" style="color:#b8860b;">Click here to download</a></p>`;
    } else if (g.product.delivery_type === 'assessment') {
      deliveryNote = `<p style="margin:0 0 4px 0;">🧭 <strong>Access Your Assessment:</strong> <a href="https://nlcfirm.com${g.accessLink}" style="color:#b8860b;">Launch Assessment Tool</a></p>`;
    } else if (g.product.delivery_type === 'course') {
      deliveryNote = `<p style="margin:0 0 4px 0;">🎓 <strong>Start Your Course:</strong> <a href="https://nlcfirm.com/portal.html" style="color:#b8860b;">Go to Client Portal → My Courses</a></p>`;
    }
    return `
      <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin-bottom:12px;border-left:4px solid #b8860b;">
        <p style="margin:0 0 6px 0;font-size:1.05rem;font-weight:700;color:#1a1a2e;">${g.product.name}</p>
        ${deliveryNote}
      </div>`;
  }).join('');

  const portalSection = isNewClient ? `
    <div style="background:#fff3cd;border-radius:8px;padding:16px;margin:20px 0;border:1px solid #ffc107;">
      <p style="margin:0 0 8px 0;font-weight:700;color:#1a1a2e;">🔐 Your Client Portal Account</p>
      <p style="margin:0 0 4px 0;">We created a secure portal account for you automatically.</p>
      <p style="margin:0 0 4px 0;"><strong>Login:</strong> <a href="https://nlcfirm.com/portal-login.html">portal-login.html</a></p>
      <p style="margin:0 0 4px 0;"><strong>Email:</strong> (your email address)</p>
      <p style="margin:0;"><strong>Temporary Password:</strong> <code style="background:#e9ecef;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>
      <p style="margin-top:8px;font-size:0.875rem;color:#666;">Please log in and change your password under Profile Settings.</p>
    </div>` : `
    <div style="background:#e8f5e9;border-radius:8px;padding:14px;margin:20px 0;">
      <p style="margin:0;">✅ Access all your products anytime via your <a href="https://nlcfirm.com/portal.html">Client Portal</a>.</p>
    </div>`;

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><style>body{font-family:'Inter',Arial,sans-serif;color:#333;line-height:1.6;margin:0;padding:0;background:#f4f4f4;}
    .wrapper{max-width:600px;margin:0 auto;padding:20px;}
    .card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);}
    .header{background:linear-gradient(135deg,#1a1a2e,#2d2d5f);padding:30px;text-align:center;}
    .header h1{color:#fff;margin:0;font-size:1.5rem;font-weight:700;}
    .header p{color:rgba(255,255,255,0.8);margin:6px 0 0;}
    .body{padding:28px;}
    .footer{text-align:center;padding:20px;font-size:0.8rem;color:#999;}
    </style></head>
    <body>
    <div class="wrapper">
      <div class="card">
        <div class="header">
          <h1>🏆 Purchase Confirmed!</h1>
          <p>New Level Consultants</p>
        </div>
        <div class="body">
          <p style="font-size:1.1rem;">Hello <strong>${firstName}</strong>,</p>
          <p>Thank you for your purchase! Your order is confirmed and your products are ready to access.</p>
          <h3 style="color:#1a1a2e;margin:20px 0 12px;border-bottom:2px solid #b8860b;padding-bottom:8px;">📦 Your Products</h3>
          ${productRows}
          ${portalSection}
          <p style="margin-top:24px;">Questions? Reply to this email or call us at <strong>786-408-4243</strong>.</p>
          <p>— The New Level Consultants Team</p>
        </div>
        <div class="footer">
          <p>© 2026 New Level Consultants · <a href="https://nlcfirm.com">nlcfirm.com</a></p>
          <p>This email was sent because you made a purchase at nlcfirm.com.</p>
        </div>
      </div>
    </div>
    </body></html>`;
}

// ════════════════════════════════════════════════════════════
//  POST /api/payments/verify
//  Called from frontend after PayPal captures funds
// ════════════════════════════════════════════════════════════
router.post('/verify', async (req, res) => {
  const { orderID, productID, productName, price, payerEmail, payerFirstName, payerLastName } = req.body;

  if (!orderID || !productID || !payerEmail) {
    return res.status(400).json({ error: 'Missing required payment fields.' });
  }

  try {
    const db = await getDb();

    // 1. Look up the product(s) from our catalog
    const [productRows] = await db.execute(
      'SELECT * FROM products WHERE product_id = ? AND is_active = 1',
      [productID]
    );

    if (productRows.length === 0) {
      return res.status(400).json({ error: `Product "${productID}" not found in catalog.` });
    }

    const mainProduct = productRows[0];
    let productsToGrant = [mainProduct];

    // If it's a bundle, expand to all sub-products
    if (mainProduct.delivery_type === 'bundle' && mainProduct.delivery_value) {
      const subIds = mainProduct.delivery_value.split(',').map(s => s.trim());
      const placeholders = subIds.map(() => '?').join(',');
      const [subProducts] = await db.execute(
        `SELECT * FROM products WHERE product_id IN (${placeholders}) AND is_active = 1`,
        subIds
      );
      productsToGrant = subProducts;
    }

    // 2. Find or create client
    let clientId;
    let isNewClient = false;
    let generatedPassword = null;

    const [existing] = await db.execute('SELECT id FROM clients WHERE email = ?', [payerEmail]);
    if (existing.length > 0) {
      clientId = existing[0].id;
    } else {
      generatedPassword = crypto.randomBytes(8).toString('hex');
      const hash = await bcrypt.hash(generatedPassword, 12);
      const [insertResult] = await db.execute(
        'INSERT INTO clients (email, password_hash, first_name, last_name, is_active) VALUES (?, ?, ?, ?, 1)',
        [payerEmail, hash, payerFirstName || 'Client', payerLastName || '']
      );
      clientId = insertResult.insertId;
      isNewClient = true;
    }

    // 3. Grant access to each product
    const grants = [];
    for (const product of productsToGrant) {
      const grant = await grantProductAccess(db, clientId, product);
      grants.push(grant);
    }

    // Also record the bundle purchase itself if it's a bundle
    if (mainProduct.delivery_type === 'bundle') {
      const [existingBundle] = await db.execute(
        'SELECT id FROM client_purchases WHERE client_id = ? AND product_id = ?',
        [clientId, mainProduct.product_id]
      );
      if (existingBundle.length === 0) {
        await db.execute(
          'INSERT INTO client_purchases (client_id, product_id, product_name, access_link) VALUES (?, ?, ?, ?)',
          [clientId, mainProduct.product_id, mainProduct.name, '/portal.html']
        );
      }
    }

    // 4. Send confirmation email
    const emailHtml = buildConfirmationEmail(payerFirstName || 'Valued Client', grants, isNewClient, generatedPassword);
    sendEmail({
      to: payerEmail,
      subject: `✅ Your NLC Purchase is Confirmed — ${mainProduct.name}`,
      html: emailHtml
    }).catch(err => console.error('Purchase confirmation email error:', err));

    res.json({
      success: true,
      clientId,
      isNewClient,
      grants: grants.map(g => ({
        productId: g.product.product_id,
        productName: g.product.name,
        deliveryType: g.product.delivery_type,
        accessLink: g.accessLink
      }))
    });

  } catch (err) {
    console.error('Payment Verification Error:', err);
    res.status(500).json({ error: 'Failed to process the order.' });
  }
});

module.exports = router;
