const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { seedIfEmpty } = require('./seed');

async function migrate() {
  try {
    // Ensure the data directory exists (needed for SQLite on Railway)
    const dataDir = path.join(__dirname, '..', '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Created data directory:', dataDir);
    }

    // Push schema to database (creates tables if they don't exist)
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..', '..'),
    });

    console.log('Database schema ready.');

    // Seed demo data if the database is empty
    await seedIfEmpty();
  } catch (err) {
    console.error('Database setup failed:', err.message);
    // Don't crash the server — it may still work if DB already exists
  }
}

module.exports = { migrate };
