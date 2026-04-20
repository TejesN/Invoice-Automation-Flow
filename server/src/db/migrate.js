const path = require('path');
const fs = require('fs');
const { seedIfEmpty } = require('./seed');

async function migrate() {
  // Ensure the data directory exists
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory:', dataDir);
  }

  // Seed demo data if the database is empty
  // Set RESEED=true in Railway Variables to force a fresh seed
  await seedIfEmpty({ force: process.env.RESEED === 'true' });
}

module.exports = { migrate };
