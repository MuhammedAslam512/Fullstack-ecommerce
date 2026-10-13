const { readDatabase } = require('../db');

class GetOrderAnalyticsHandler {
  async handle(query) {
    // Ultra-fast read directly from pre-computed Read Store!
    // No $group or $sum calculations required at query time!
    return {
      summary: readDatabase.analytics,
      recentOrders: readDatabase.orderSummaries
    };
  }
}

module.exports = GetOrderAnalyticsHandler;