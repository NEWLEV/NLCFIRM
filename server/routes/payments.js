const express = require('express');
const { getDb } = require('../db');
const { sendClientWelcome } = require('../services/email');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();

// This endpoint is called from the frontend after PayPal successfully captures funds
// POST /api/payments/verify
router.post('/verify', async (req, res) => {
  const { orderID, productID, productName, price, payerEmail, payerFirstName, payerLastName } = req.body;
  
  try {
    const db = await getDb();
    // 1. Verify the orderID via PayPal's Node SDK or API
    // (In a full production scenario, you would do a server-to-server call to verify the Order ID with PayPal)
    // For this implementation, we assume the frontend SDK handled the capture, but we still secure the DB insert.
    
    // 2. See if the client already exists
    let client = await db.get('SELECT id FROM clients WHERE email = ?', [payerEmail]);
    let clientId;
    let isNewClient = false;
    let generatedPassword = null;

    if (client) {
      clientId = client.id;
    } else {
      // Create new client account automatically
      generatedPassword = crypto.randomBytes(8).toString('hex');
      const hash = await bcrypt.hash(generatedPassword, 12);
      
      const insertResult = await db.run(`
        INSERT INTO clients (email, password_hash, first_name, last_name, is_active)
        VALUES (?, ?, ?, ?, 1)
      `, [payerEmail, hash, payerFirstName, payerLastName]);
      
      clientId = insertResult.lastID;
      isNewClient = true;
    }

    // 3. Grant the product access in client_purchases
    // For digital tools, the access link is typically predefined or generated.
    // Here we'll map productID to a placeholder secure link. In a real CMS, this would pull from a `products` table.
    const accessLink = `https://nlcfirm.com/downloads/${productID}.pdf`; 

    await db.run(`
      INSERT INTO client_purchases (client_id, product_id, product_name, access_link)
      VALUES (?, ?, ?, ?)
    `, [clientId, productID, productName, accessLink]);

    // 4. Send Email Notification
    if (isNewClient) {
      // If it's a new client, we send a custom welcome email WITH their temporary password
      const emailHtml = `
        <h2>Thank you for your purchase, ${payerFirstName}!</h2>
        <p>Your order for <strong>${productName}</strong> is complete.</p>
        <p>We've automatically created a secure Client Portal account for you to access your digital downloads.</p>
        <p><strong>Login:</strong> <a href="https://nlcfirm.com/portal-login.html">https://nlcfirm.com/portal-login.html</a></p>
        <p><strong>Email:</strong> ${payerEmail}</p>
        <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
        <br>
        <p>We recommend logging in and updating your password immediately under Profile Settings.</p>
        <p>- The NLC Firm Team</p>
      `;
      const { sendEmail } = require('../services/email');
      sendEmail({ to: payerEmail, subject: "Your NLC Purchase & Portal Access", html: emailHtml })
        .catch(err => console.error("Auto-client welcome error:", err));
    }

    res.json({ success: true, clientId, isNewClient });
  } catch (err) {
    console.error('Payment Verification Error:', err);
    res.status(500).json({ error: 'Failed to process the order.' });
  }
});

module.exports = router;
