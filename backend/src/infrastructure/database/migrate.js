const fs = require('fs');
const path = require('path');
const { db } = require('./connection');
const { logger } = require('../logger');

async function runMigrations() {
  logger.info('Starting database migration runner...');
  const migrationsDir = path.resolve(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      await db.query(sql);
      logger.info({ file }, 'Migration applied successfully');
    } catch (err) {
      logger.error({ file, error: err.message }, 'Migration execution failed');
      throw err;
    }
  }

  logger.info('All database migrations applied successfully');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations };
