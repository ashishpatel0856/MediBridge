const { getDb } = require('../../infrastructure/database/connection');

// Query audit logs with pagination and filters
const getAuditLogs = async (options = {}) => {
  const db = getDb();
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];
  let idx = 1;

  if (options.actorId) {
    conditions.push(`actor_id = $${idx++}`);
    params.push(options.actorId);
  }
  if (options.resourceType) {
    conditions.push(`resource_type = $${idx++}`);
    params.push(options.resourceType);
  }
  if (options.action) {
    conditions.push(`action = $${idx++}`);
    params.push(options.action);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await db.query(`SELECT COUNT(*) as total FROM audit_logs ${whereClause}`, params);
  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  const dataParams = [...params, limit, offset];
  const logsRes = await db.query(
    `SELECT 
      id, actor_id as "actorId", actor_role as "actorRole",
      action, resource_type as "resourceType", resource_id as "resourceId",
      ip_address as "ipAddress", user_agent as "userAgent", status, metadata,
      created_at as "createdAt"
     FROM audit_logs
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    dataParams
  );

  return {
    data: logsRes.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
  };
};

module.exports = {
  getAuditLogs,
  auditService: {
    getAuditLogs
  }
};
