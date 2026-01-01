const Post = require('../models/Post');

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const { status, platform, startDate, endDate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (platform) query.platform = platform;

    if (startDate && endDate) {
      if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format',
        });
      }

      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    console.error('GET POSTS ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('GET POST ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new post (FIXED)
exports.createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      platform,
      status = 'draft',
      publishedTime,
      scheduledTime,
      metrics,
    } = req.body;

    // ✅ Required field validation
    if (!title || !content || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and platform are required',
      });
    }

    const post = await Post.create({
      title,
      content,
      platform,
      status,
      publishedTime: publishedTime || null,
      scheduledTime: scheduledTime || null,
      metrics: metrics || {
        likes: 0,
        shares: 0,
        comments: 0,
        clicks: 0,
        impressions: 0,
      },
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('CREATE POST ERROR:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('UPDATE POST ERROR:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('DELETE POST ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk update scheduling
exports.bulkUpdateSchedule = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || !updates.length) {
      return res.status(400).json({
        success: false,
        error: 'Updates array is required',
      });
    }

    const updatedPosts = await Promise.all(
      updates.map(update =>
        Post.findByIdAndUpdate(
          update.id,
          {
            scheduledTime: update.scheduledTime,
            status: 'scheduled',
          },
          { new: true }
        )
      )
    );

    res.json({ success: true, data: updatedPosts });
  } catch (error) {
    console.error('BULK UPDATE ERROR:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};
