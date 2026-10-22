const { getDb } = require('../infrastructure/database/connection');
const { idempotencyReplaysCounter } = require('../infrastructure/metrics/prometheus');
const { ConflictError } = require('../domain/errors/app-errors');

const idempotencyMiddleware = async (req, res, next) => {
  // Only process write operations
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.header('idempotency-key') || req.header('x-idempotency-key');
  if (!idempotencyKey) {
    return next();
  }

  const db = getDb();

  try {
    // 1. Check if the key already exists in PostgreSQL
    const existing = await db.query(
      'SELECT status_code as "statusCode", response_body as "responseBody", expires_at as "expiresAt" FROM idempotency_keys WHERE key = $1',
      [idempotencyKey]
    );

    if (existing.rows.length > 0) {
      const record = existing.rows[0];
      if (new Date(record.expiresAt) > new Date()) {
        idempotencyReplaysCounter.inc();
        res.setHeader('X-Idempotent-Replay', 'true');
        res.setHeader('X-Cache-Lookup', 'HIT');
        const parsedBody = typeof record.responseBody === 'string' ? JSON.parse(record.responseBody) : record.responseBody;
        return res.status(record.statusCode).json(parsedBody);
      }
    }

    // 2. Intercept response to store result in PostgreSQL
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      res.json = originalJson;

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      db.query(
        `INSERT INTO idempotency_keys (key, actor_id, path, status_code, response_body, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (key) DO NOTHING`,
        [
          idempotencyKey,
          req.user?.userId || null,
          req.originalUrl,
          res.statusCode,
          JSON.stringify(body),
          expiresAt
        ]
      ).catch(() => {});

      return originalJson(body);
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { idempotencyMiddleware };
