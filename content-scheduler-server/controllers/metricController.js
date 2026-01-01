const { 
  getEngagementByTimePeriod, 
  getTopPerformingPosts,
  getPlatformMetrics,
  getEngagementTrends 
} = require('../services/analyticsService');

// Get engagement metrics by time period
exports.getEngagementMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Start date and end date are required' 
      });
    }

    const metrics = await getEngagementByTimePeriod(startDate, endDate);
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get top performing posts
exports.getTopPosts = async (req, res) => {
  try {
    const { platform, limit } = req.query;
    const posts = await getTopPerformingPosts(platform, parseInt(limit) || 10);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get platform-specific metrics
exports.getPlatformStats = async (req, res) => {
  try {
    const metrics = await getPlatformMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get engagement trends
exports.getTrends = async (req, res) => {
  try {
    const { days } = req.query;
    const trends = await getEngagementTrends(parseInt(days) || 30);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};