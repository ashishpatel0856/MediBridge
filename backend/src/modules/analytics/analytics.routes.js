const { Router } = require('express');
const { analyticsController } = require('./analytics.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');

const router = Router();

router.get(
  '/overview',
  authenticate,
  requireRole('ADMIN'),
  analyticsController.getOverview
);

module.exports = router;
