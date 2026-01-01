const { 
  analyzeEngagementPatterns, 
  generateHeadline,
  predictEngagement 
} = require('../services/openaiService');
const { getTopPerformingPosts } = require('../services/analyticsService');
const Post = require('../models/Post');

// Get optimal posting times based on historical data
exports.getOptimalTimes = async (req, res) => {
  try {
    const { platform } = req.query;
    
    // Get historical posts with good engagement
    const query = { status: 'published', engagementScore: { $gte: 50 } };
    if (platform) query.platform = platform;
    
    const historicalPosts = await Post.find(query)
      .sort({ engagementScore: -1 })
      .limit(50);

    if (historicalPosts.length < 5) {
      return res.json({
        success: true,
        message: 'Insufficient data for AI analysis',
        data: {
          optimalTimes: [],
          recommendations: 'Add more published posts to get AI recommendations'
        }
      });
    }

    const analysis = await analyzeEngagementPatterns(historicalPosts);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate headline suggestions
exports.generateHeadlines = async (req, res) => {
  try {
    const { topic, platform } = req.body;
    
    if (!topic || !platform) {
      return res.status(400).json({ 
        success: false, 
        error: 'Topic and platform are required' 
      });
    }

    // Get top performing headlines for reference
    const topPosts = await getTopPerformingPosts(platform, 5);
    const topHeadlines = topPosts.map(post => post.title);

    const headlines = await generateHeadline(topic, platform, topHeadlines);
    res.json({ success: true, data: headlines });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Predict engagement for a scheduled time
exports.predictPostEngagement = async (req, res) => {
  try {
    const { platform, scheduledTime, contentType } = req.body;
    
    if (!platform || !scheduledTime) {
      return res.status(400).json({ 
        success: false, 
        error: 'Platform and scheduled time are required' 
      });
    }

    const prediction = await predictEngagement(
      platform, 
      scheduledTime, 
      contentType || 'general'
    );
    
    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};