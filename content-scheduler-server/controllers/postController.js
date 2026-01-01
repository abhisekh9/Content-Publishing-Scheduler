const Post = require('../models/Post');

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const { status, platform, startDate, endDate } = req.query;
    let query = {};

    if (status) query.status = status;
    if (platform) query.platform = platform;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new post
exports.createPost = async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
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
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk update (for drag-and-drop scheduling)
exports.bulkUpdateSchedule = async (req, res) => {
  try {
    const { updates } = req.body; // Array of {id, scheduledTime}
    
    const promises = updates.map(update => 
      Post.findByIdAndUpdate(
        update.id,
        { scheduledTime: update.scheduledTime, status: 'scheduled' },
        { new: true }
      )
    );
    
    const updatedPosts = await Promise.all(promises);
    res.json({ success: true, data: updatedPosts });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};