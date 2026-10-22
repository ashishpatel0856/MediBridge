const { auditService } = require('./audit.service');

class AuditController {
  async getAuditLogs(req, res, next) {
    try {
      const result = await auditService.getAuditLogs({
        actorId: req.query.actorId,
        resourceType: req.query.resourceType,
        action: req.query.action,
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20
      });
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
}

const auditController = new AuditController();

module.exports = {
  auditController,
  AuditController
};
