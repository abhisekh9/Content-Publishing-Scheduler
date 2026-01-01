const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  platform: { 
    type: String, 
    enum: ['Twitter', 'LinkedIn', 'Facebook', 'Instagram'], 
    required: true 
  },
  scheduledTime: { type: Date },
  publishedTime: { type: Date },
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'published'], 
    default: 'draft' 
  },
  aiSuggestedHeadline: { type: String },
  aiSuggestedTime: { type: Date },
  engagementScore: { type: Number, default: 0 },
  metrics: {
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Calculate engagement score before saving
postSchema.pre('save', function(next) {
  if (this.metrics && this.metrics.impressions > 0) {
    const totalEngagement = this.metrics.likes + this.metrics.shares + 
                           this.metrics.comments + this.metrics.clicks;
    this.engagementScore = (totalEngagement / this.metrics.impressions) * 100;
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);