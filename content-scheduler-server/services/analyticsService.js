const Post = require('../models/Post');

/* ---------------- UTILS ---------------- */
const normalizePlatform = (platform) => {
  if (!platform) return null;
  return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
};

/* ---------------- ENGAGEMENT BY TIME PERIOD ---------------- */
const getEngagementByTimePeriod = async (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      throw new Error('Invalid date range');
    }

    const results = await Post.aggregate([
      {
        $match: {
          status: 'published',
          publishedTime: { $ne: null, $gte: start, $lte: end },
        },
      },
      {
        $project: {
          platform: 1,
          engagementScore: 1,
          metrics: 1,
          hourOfDay: { $hour: '$publishedTime' },
          // Convert Mongo 1–7 → 0–6
          dayOfWeek: { $subtract: [{ $dayOfWeek: '$publishedTime' }, 1] },
        },
      },
      {
        $group: {
          _id: {
            platform: '$platform',
            hourOfDay: '$hourOfDay',
            dayOfWeek: '$dayOfWeek',
          },
          avgEngagement: { $avg: '$engagementScore' },
          totalPosts: { $sum: 1 },
          avgLikes: { $avg: '$metrics.likes' },
          avgShares: { $avg: '$metrics.shares' },
          avgComments: { $avg: '$metrics.comments' },
          avgClicks: { $avg: '$metrics.clicks' },
          avgImpressions: { $avg: '$metrics.impressions' },
        },
      },
      {
        $sort: { avgEngagement: -1 },
      },
    ]);

    return results;
  } catch (error) {
    console.error('ANALYTICS ERROR:', error.message);
    throw new Error(`Analytics aggregation failed`);
  }
};

/* ---------------- TOP PERFORMING POSTS ---------------- */
const getTopPerformingPosts = async (platform = null, limit = 10) => {
  try {
    const query = { status: 'published' };
    const normalizedPlatform = normalizePlatform(platform);

    if (normalizedPlatform) {
      query.platform = normalizedPlatform;
    }

    return await Post.find(query)
      .sort({ engagementScore: -1 })
      .limit(limit)
      .select(
        'title content platform publishedTime engagementScore metrics'
      );
  } catch (error) {
    console.error('TOP POSTS ERROR:', error.message);
    throw new Error('Failed to fetch top posts');
  }
};

/* ---------------- PLATFORM METRICS ---------------- */
const getPlatformMetrics = async () => {
  try {
    const metrics = await Post.aggregate([
      {
        $match: {
          status: 'published',
          publishedTime: { $ne: null },
        },
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
          totalImpressions: { $sum: '$metrics.impressions' },
        },
      },
      {
        $sort: { avgEngagement: -1 },
      },
    ]);

    return metrics;
  } catch (error) {
    console.error('PLATFORM METRICS ERROR:', error.message);
    throw new Error('Platform metrics calculation failed');
  }
};

/* ---------------- ENGAGEMENT TRENDS ---------------- */
const getEngagementTrends = async (days = 30) => {
  try {
    const period = Number.isInteger(days) ? days : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const trends = await Post.aggregate([
      {
        $match: {
          status: 'published',
          publishedTime: { $ne: null, $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$publishedTime',
              },
            },
            platform: '$platform',
          },
          avgEngagement: { $avg: '$engagementScore' },
          postCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    return trends;
  } catch (error) {
    console.error('TRENDS ERROR:', error.message);
    throw new Error('Trends calculation failed');
  }
};

module.exports = {
  getEngagementByTimePeriod,
  getTopPerformingPosts,
  getPlatformMetrics,
  getEngagementTrends,
};
