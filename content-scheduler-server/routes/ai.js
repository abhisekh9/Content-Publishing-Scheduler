const express = require('express');
const router = express.Router();
const {
  getOptimalTimes,
  generateHeadlines,
  predictPostEngagement
} = require('../controllers/aiController');

router.get('/optimal-times', getOptimalTimes);
router.post('/headlines', generateHeadlines);
router.post('/predict-engagement', predictPostEngagement);

module.exports = router;