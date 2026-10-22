const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../infrastructure/database/connection');
const { logger } = require('../infrastructure/logger');

// Asynchronous audit logging middleware for compliance and auditability
const auditLog = (action, resourceType) => {
  return (req, res, next) => {
    const actorId = req.user?.userId || null;
    const actorRole = req.user?.role || 'ANONYMOUS';
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    res.on('finish', async () => {
      const status = res.statusCode < 400 ? 'SUCCESS' : 'FAILURE';
      const resourceId = req.params.id || req.body?.id || req.body?.consultationId || null;
      const db = getDb();

      try {
        await db.query(
          `INSERT INTO audit_logs (id, actor_id, actor_role, action, resource_type, resource_id, ip_address, user_agent, status, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            uuidv4(),
            actorId,
            actorRole,
            action,
            resourceType,
            resourceId,
            ipAddress,
            userAgent,
            status,
            JSON.stringify({
              path: req.originalUrl,
              method: req.method,
              statusCode: res.statusCode,
              correlationId: req.correlationId
            })
          ]
        );
      } catch (err) {
        logger.error({ error: err.message }, 'Failed to record audit log');
      }
    });

    next();
  };
};

module.exports = { auditLog };
