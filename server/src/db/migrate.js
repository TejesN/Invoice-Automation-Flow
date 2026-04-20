const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { seedIfEmpty } = require('./seed');

async function migrate() {
  // Ensure the data directory exists
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory:', dataDir);
  }

  // Push schema to database at runtime (DATABASE_URL is available here)
  try {
    console.log('Running prisma db push...');
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..', '..'),
    });
    console.log('prisma db push complete.');
  } catch (err) {
    console.error('prisma db push failed:', err.message);
    throw err;
  }

  // Seed demo data if the database is empty
  // Set RESEED=true in Railway Variables to force a fresh seed
  await seedIfEmpty({ force: process.env.RESEED === 'true' });
}

module.exports = { migrate };
