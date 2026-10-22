const { Pool } = require('pg');
const { config } = require('../../config/env');
const { logger } = require('../logger');

// Clean, single PostgreSQL connection pool
let pool = null;

const getPool = () => {
  if (!pool && config.db.url) {
    pool = new Pool({
      connectionString: config.db.url,
      min: config.db.poolMin,
      max: config.db.poolMax,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      logger.error({ error: err.message }, 'Unexpected idle PostgreSQL client error');
    });
  }
  return pool;
};

/**
 * Execute a parameterized SQL query
 */
const query = async (text, params) => {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database connection pool is not configured');
  }
  return currentPool.query(text, params);
};

/**
 * Execute operations within an atomic PostgreSQL transaction
 */
const withTransaction = async (callback) => {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database connection pool is not configured');
  }

  const client = await currentPool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Liveness/readiness ping
 */
const ping = async () => {
  try {
    const res = await query('SELECT 1 as alive');
    return res.rows.length > 0;
  } catch {
    return false;
  }
};

/**
 * Graceful database connection pool shutdown
 */
const close = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

// Top-level exported database object
const db = {
  query,
  withTransaction,
  ping,
  close,
  getPool,
};

// For test environments: dynamic database reference allows injecting test mock cleanly
let activeDb = db;

// If in automated test mode without real DATABASE_URL, fallback to isolated test mock helper
if (process.env.NODE_ENV === 'test' && (!config.db.url || config.db.url === '')) {
  const { MockDatabaseConnection } = require('../../../tests/helpers/mock-db');
  activeDb = new MockDatabaseConnection();
}

const getDb = () => activeDb;

const setDatabaseConnection = (customDb) => {
  activeDb = customDb;
};

module.exports = {
  get db() {
    return activeDb;
  },
  getDb,
  query: (text, params) => activeDb.query(text, params),
  withTransaction: (callback) => activeDb.withTransaction(callback),
  ping: () => activeDb.ping(),
  close: () => activeDb.close(),
  isMock: () => (activeDb.isMock ? activeDb.isMock() : false),
  setDatabaseConnection,
  getDatabaseConnection: getDb,
};
