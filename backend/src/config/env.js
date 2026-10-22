require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// In production, validate critical secrets at boot time
if (isProduction) {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DATA_ENCRYPTION_KEY',
    'DOCTOR_SIGNATURE_SECRET'
  ];

  const missing = requiredVars.filter((key) => !process.env[key] || process.env[key].trim() === '');
  if (missing.length > 0) {
    throw new Error(`CRITICAL CONFIG ERROR: Missing required production environment variables: ${missing.join(', ')}`);
  }
}

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv,
  env: nodeEnv,
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // Database (PostgreSQL - primary DATABASE_URL)
  databaseUrl: process.env.DATABASE_URL || '',
  db: {
    url: process.env.DATABASE_URL || '',
    poolMin: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    ssl: process.env.DB_SSL === 'true',
  },

  // Admin Configuration
  admin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
  },

  // Security & JWT
  jwt: {
    secret: process.env.JWT_SECRET || (isProduction ? undefined : 'dev-jwt-access-secret-minimum-32-chars-long!'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || (isProduction ? undefined : 'dev-jwt-refresh-secret-minimum-32-chars-long!'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Cryptography
  security: {
    dataEncryptionKey: process.env.DATA_ENCRYPTION_KEY || (isProduction ? undefined : 'dev-encryption-key-32bytes-long!'),
    doctorSignatureSecret: process.env.DOCTOR_SIGNATURE_SECRET || (isProduction ? undefined : 'dev-doctor-signature-secret-key-999'),
  },

  // Rate Limiting (In-memory)
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // Stripe Payment Gateway
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: process.env.STRIPE_CURRENCY || 'inr',
  },

  // Observability
  observability: {
    logLevel: process.env.LOG_LEVEL || 'info',
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
  },
};

module.exports = { config };
