const Post = require('../models/Post');
const Metric = require('../models/Metric');

/**
 * Get aggregated engagement metrics by time periods
 */
const getEngagementByTimePeriod = async (startDate, endDate) => {
  try {
    const results = await Post.aggregate([
      {
        $match: {
          publishedTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
          status: 'published'
        }
      },
      {
        $project: {
          hourOfDay: { $hour: '$publishedTime' },
          dayOfWeek: { $dayOfWeek: '$publishedTime' },
          platform: 1,
          engagementScore: 1,
          'metrics.likes': 1,
          'metrics.shares': 1,
          'metrics.comments': 1,
          'metrics.clicks': 1,
          'metrics.impressions': 1
        }
      },
      {
        $group: {
          _id: {
            hourOfDay: '$hourOfDay',
            dayOfWeek: '$dayOfWeek',
            platform: '$platform'
          },
          avgEngagement: { $avg: '$engagementScore' },
          totalPosts: { $sum: 1 },
          avgLikes: { $avg: '$metrics.likes' },
          avgShares: { $avg: '$metrics.shares' },
          avgComments: { $avg: '$metrics.comments' },
          avgClicks: { $avg: '$metrics.clicks' },
          avgImpressions: { $avg: '$metrics.impressions' }
        }
      },
      {
        $sort: { avgEngagement: -1 }
      }
    ]);

    return results;
  } catch (error) {
    throw new Error(`Analytics aggregation failed: ${error.message}`);
  }
};

/**
 * Get top performing posts
 */
const getTopPerformingPosts = async (platform = null, limit = 10) => {
  try {
    const query = { status: 'published' };
    if (platform) query.platform = platform;

    const posts = await Post.find(query)
      .sort({ engagementScore: -1 })
      .limit(limit)
      .select('title content platform publishedTime engagementScore metrics');

    return posts;
  } catch (error) {
    throw new Error(`Failed to fetch top posts: ${error.message}`);
  }
};

/**
 * Calculate platform-specific metrics
 */
const getPlatformMetrics = async () => {
  try {
    const metrics = await Post.aggregate([
      {
        $match: { status: 'published' }
      },
      {
        $group: {
          _id: '$platform',
          totalPosts: { $sum: 1 },
          avgEngagement: { $avg: '$engagementScore' },
          totalLikes: { $sum: '$metrics.likes' },
          totalShares: { $sum: '$metrics.shares' },
          totalComments: { $sum: '$metrics.comments' },
          totalClicks: { $sum: '$metrics.clicks' },
          totalImpressions: { $sum: '$metrics.impressions' }
        }
      },
      {
        $sort: { avgEngagement: -1 }
      }
    ]);

    return metrics;
  } catch (error) {
    throw new Error(`Platform metrics calculation failed: ${error.message}`);
  }
};

/**
 * Get engagement trends over time
 */
const getEngagementTrends = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Post.aggregate([
      {
        $match: {
          publishedTime: { $gte: startDate },
          status: 'published'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$publishedTime' } },
            platform: '$platform'
          },
          avgEngagement: { $avg: '$engagementScore' },
          postCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    return trends;
  } catch (error) {
    throw new Error(`Trends calculation failed: ${error.message}`);
  }
};

module.exports = {
  getEngagementByTimePeriod,
  getTopPerformingPosts,
  getPlatformMetrics,
  getEngagementTrends
};