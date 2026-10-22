const { analyticsService } = require('./analytics.service');

class AnalyticsController {
  async getOverview(req, res, next) {
    try {
      const data = await analyticsService.getOverviewAnalytics();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

const analyticsController = new AnalyticsController();

module.exports = {
  analyticsController,
  AnalyticsController
};
