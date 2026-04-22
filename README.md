# NLCFirm — Healthcare & Business Consulting

This repository contains the source code for the New Level Consultants website, a premium Node.js-based web application with an Express backend and a MySQL database.

## 🚀 Deployment to Hostinger

This project is configured for seamless deployment on Hostinger's Node.js hosting.

### 1. File Structure Compliance

- **Entry Point**: `server/index.js` (Defined in `package.json`).
- **Static Files**: Located in the `/public` directory.
- **PM2 Configuration**: `ecosystem.config.js` is provided for process management.

### 2. Environment Variables (.env)

You must set up the following variables in the Hostinger Node.js panel or via a `.env` file in the root:

- `NODE_ENV=production`
- `PORT=3000` (Hostinger may provide this dynamically)
- `JWT_SECRET` (A long random string)
- `BASE_URL=https://yourdomain.com`
- `ADMIN_EMAIL` (For initial seed)
- `ADMIN_DEFAULT_PASSWORD` (For initial seed)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (For email notifications)
- `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET` (For payments)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` (For MySQL connection)

### 3. Installation & Startup

1. Upload all files (excluding `node_modules`, `.git`, and `*.db`).
2. Run `npm install` via the Hostinger terminal or panel.
3. Start the application:
   - **Recommended**: Link the Node.js application to `server/index.js` in the Hostinger panel.
   - **Manual**: Run `pm2 start ecosystem.config.js`.

### 4. Database

The application uses MySQL (`mysql2` package without native bindings). This is natively supported by Hostinger's standard cPanel interface. Tables and default data will be automatically seeded on first startup.

---

**Note**: The root `index.html` has been removed as it is a redundant backup. The live landing page is managed at `public/index.html`.
