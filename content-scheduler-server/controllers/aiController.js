const Post = require('../models/Post');
const Metric = require('../models/Metric');

const {
  analyzeEngagementPatterns,
  generateHeadline,
  predictEngagement,
} = require('../services/geminiService');

/* ---------------- OPTIMAL TIMES ---------------- */
exports.getOptimalTimes = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' }).limit(20);

    // ✅ HARD GUARD
    if (!posts || posts.length < 5) {
      return res.json({
        success: true,
        data: {
          optimalTimes: [],
          contentPatterns: [],
          platformInsights: {},
          recommendations:
            'Not enough data yet. Publish more posts to unlock AI insights.',
        },
      });
    }

    const analysis = await analyzeEngagementPatterns(posts);

    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error('AI OPTIMAL TIME ERROR:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI insights',
    });
  }
};

/* ---------------- HEADLINES ---------------- */
exports.generateHeadlines = async (req, res) => {
  try {
    // Accept both naming conventions
    const content = req.body.content || req.body.topic;
    const platform = req.body.platform || req.body.tone;

    if (!content || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Content/topic and platform/tone are required',
      });
    }

    console.log('Generating headlines for:', { content, platform });

    const headlines = await generateHeadline(content, platform);

    res.json({
      success: true,
      data: headlines,
    });
  } catch (err) {
    console.error('AI HEADLINE ERROR:', err);
    console.error('Error details:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to generate headlines',
      details: err.message, // Include error details for debugging
    });
  }
};

/* ---------------- ENGAGEMENT ---------------- */
exports.predictPostEngagement = async (req, res) => {
  try {
    const prediction = await predictEngagement(req.body);
    res.json({ success: true, data: prediction });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Prediction failed',
    });
  }
};
