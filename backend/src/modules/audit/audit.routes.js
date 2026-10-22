const { Router } = require('express');
const { auditController } = require('./audit.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');

const router = Router();

router.get(
  '/',
  authenticate,
  requireRole('ADMIN'),
  auditController.getAuditLogs
);

module.exports = router;
