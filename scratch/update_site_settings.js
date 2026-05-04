const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSettings() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  console.log('Connected to database. Updating site settings...');

  const updates = [
    ['hero_eyebrow', 'Practical Consulting for Small Businesses'],
    ['hero_title', 'Practical <em>consulting</em> for small businesses that mean business.'],
    ['hero_subtitle', 'We help healthcare practices, small businesses, and growing organizations build compliance programs, streamline operations, and implement AI — with clear roadmaps and real results. No enterprise price tag required.'],
  ];

  for (const [key, value] of updates) {
    await connection.execute('UPDATE site_settings SET value = ? WHERE `key` = ?', [value, key]);
    console.log(`Updated ${key}`);
  }

  await connection.end();
  console.log('Update complete.');
}

updateSettings().catch(console.error);
