const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },

    platform: {
      type: String,
      enum: ['Twitter', 'LinkedIn', 'Facebook', 'Instagram'],
      required: true,
      set: value =>
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    engagementRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    reach: {
      type: Number,
      default: 0,
      min: 0,
    },

    hourOfDay: {
      type: Number,
      min: 0,
      max: 23,
    },

    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6, // 0 = Sunday
    },

    deviceType: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet'],
      default: 'desktop',
    },

    location: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

/* ---------------- DERIVED FIELDS ---------------- */

// Auto-derive hour & day from timestamp
metricSchema.pre('save', function (next) {
  const date = this.timestamp ? new Date(this.timestamp) : new Date();

  if (!isNaN(date)) {
    this.hourOfDay = date.getHours();
    this.dayOfWeek = date.getDay();
  }

  next();
});

// Handle updates as well
metricSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update?.timestamp) {
    const date = new Date(update.timestamp);

    if (!isNaN(date)) {
      update.hourOfDay = date.getHours();
      update.dayOfWeek = date.getDay();
    }
  }

  this.setUpdate(update);
  next();
});

/* ---------------- INDEXES (ANALYTICS) ---------------- */

metricSchema.index({ postId: 1, timestamp: -1 });
metricSchema.index({ platform: 1, dayOfWeek: 1, hourOfDay: 1 });
metricSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Metric', metricSchema);
