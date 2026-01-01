const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  platform: { type: String, required: true },
  engagementRate: { type: Number, default: 0 },
  reach: { type: Number, default: 0 },
  hourOfDay: { type: Number },
  dayOfWeek: { type: Number },
  deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet'] },
  location: { type: String }
}, { timestamps: true });

// Index for efficient querying
metricSchema.index({ postId: 1, timestamp: -1 });
metricSchema.index({ platform: 1, hourOfDay: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Metric', metricSchema);