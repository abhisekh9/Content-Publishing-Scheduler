const express = require('express');
const router = express.Router();
const {
  getEngagementMetrics,
  getTopPosts,
  getPlatformStats,
  getTrends
} = require('../controllers/metricController');

router.get('/engagement', getEngagementMetrics);
router.get('/top-posts', getTopPosts);
router.get('/platform-stats', getPlatformStats);
router.get('/trends', getTrends);

module.exports = router;