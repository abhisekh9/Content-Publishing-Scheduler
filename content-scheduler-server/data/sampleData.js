const Post = require('../models/Post');
const mongoose = require('mongoose');
require('dotenv').config();

const samplePosts = [
  // LinkedIn Posts
  {
    title: "5 Key Trends Shaping the Future of AI in 2026",
    content: "Artificial Intelligence continues to evolve. Here are the top 5 trends you need to know...",
    platform: "LinkedIn",
    publishedTime: new Date('2025-12-15T10:00:00'),
    status: "published",
    metrics: { likes: 245, shares: 67, comments: 34, clicks: 189, impressions: 5600 }
  },
  {
    title: "How We Increased Productivity by 40% Using Remote Work Tools",
    content: "Remote work is here to stay. Our team's journey to better productivity...",
    platform: "LinkedIn",
    publishedTime: new Date('2025-12-18T14:00:00'),
    status: "published",
    metrics: { likes: 312, shares: 89, comments: 45, clicks: 267, impressions: 7200 }
  },
  {
    title: "The Ultimate Guide to Data-Driven Decision Making",
    content: "In today's business landscape, data is king. Learn how to leverage analytics...",
    platform: "LinkedIn",
    publishedTime: new Date('2025-12-20T09:00:00'),
    status: "published",
    metrics: { likes: 198, shares: 54, comments: 28, clicks: 145, impressions: 4800 }
  },
  
  // Twitter Posts
  {
    title: "🚀 Just launched our new feature! Check it out",
    content: "We've been working on something special. Today, we're excited to announce...",
    platform: "Twitter",
    publishedTime: new Date('2025-12-16T12:30:00'),
    status: "published",
    metrics: { likes: 567, shares: 234, comments: 89, clicks: 423, impressions: 12000 }
  },
  {
    title: "Quick tip: How to boost your coding productivity in 3 steps",
    content: "1. Use code snippets 2. Master keyboard shortcuts 3. Automate repetitive tasks",
    platform: "Twitter",
    publishedTime: new Date('2025-12-19T16:00:00'),
    status: "published",
    metrics: { likes: 445, shares: 178, comments: 67, clicks: 334, impressions: 9800 }
  },
  {
    title: "Breaking: New study reveals surprising insights about remote work",
    content: "According to recent research, remote workers are more productive than office workers...",
    platform: "Twitter",
    publishedTime: new Date('2025-12-22T11:00:00'),
    status: "published",
    metrics: { likes: 689, shares: 312, comments: 145, clicks: 567, impressions: 15000 }
  },
  
  // Instagram Posts
  {
    title: "Behind the scenes of our latest project ✨",
    content: "Swipe to see the process from concept to reality...",
    platform: "Instagram",
    publishedTime: new Date('2025-12-17T18:00:00'),
    status: "published",
    metrics: { likes: 1245, shares: 89, comments: 167, clicks: 456, impressions: 18000 }
  },
  {
    title: "Monday Motivation: Your weekly dose of inspiration 💪",
    content: "Success is not final, failure is not fatal: it is the courage to continue that counts",
    platform: "Instagram",
    publishedTime: new Date('2025-12-23T08:00:00'),
    status: "published",
    metrics: { likes: 2134, shares: 145, comments: 234, clicks: 678, impressions: 25000 }
  },
  
  // Facebook Posts
  {
    title: "Exciting announcement! We're expanding our team",
    content: "We're looking for talented individuals to join our growing company...",
    platform: "Facebook",
    publishedTime: new Date('2025-12-21T13:00:00'),
    status: "published",
    metrics: { likes: 389, shares: 112, comments: 78, clicks: 234, impressions: 8900 }
  },
  {
    title: "Customer Success Story: How ABC Company Achieved 200% Growth",
    content: "We're proud to share this incredible journey with one of our clients...",
    platform: "Facebook",
    publishedTime: new Date('2025-12-24T15:00:00'),
    status: "published",
    metrics: { likes: 456, shares: 134, comments: 92, clicks: 312, impressions: 10500 }
  },

  // More varied timing posts for better AI analysis
  {
    title: "Early bird special: Morning productivity hacks",
    content: "Start your day right with these proven techniques...",
    platform: "LinkedIn",
    publishedTime: new Date('2025-12-25T06:00:00'),
    status: "published",
    metrics: { likes: 167, shares: 45, comments: 23, clicks: 98, impressions: 3200 }
  },
  {
    title: "Late night thoughts on innovation and creativity",
    content: "Sometimes the best ideas come when everyone else is asleep...",
    platform: "Twitter",
    publishedTime: new Date('2025-12-26T22:00:00'),
    status: "published",
    metrics: { likes: 234, shares: 67, comments: 34, clicks: 156, impressions: 5600 }
  },
  {
    title: "Weekend vibes: Work-life balance tips",
    content: "Recharge and reset for the week ahead...",
    platform: "Instagram",
    publishedTime: new Date('2025-12-28T12:00:00'),
    status: "published",
    metrics: { likes: 1567, shares: 123, comments: 189, clicks: 534, impressions: 21000 }
  },

  // Draft posts for scheduling
  {
    title: "Upcoming webinar: Master AI Tools for Business",
    content: "Join us next week for an exclusive webinar...",
    platform: "LinkedIn",
    status: "draft"
  },
  {
    title: "New blog post coming soon!",
    content: "We're putting the finishing touches on our latest article...",
    platform: "Twitter",
    status: "draft"
  }
];

const seedDatabase = async ({ force = false } = {}) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    const existingCount = await Post.countDocuments();

    // ✅ Prevent duplicate inserts
    if (existingCount > 0 && !force) {
      console.log(
        `⚠️  Skipping seed: ${existingCount} posts already exist`
      );
      return process.exit(0);
    }

    // ⚠️ Only delete when explicitly forced
    if (force) {
      await Post.deleteMany({});
      console.log('🗑️  Existing posts deleted (FORCED)');
    }

    const posts = await Post.insertMany(samplePosts);
    console.log(`✅ Inserted ${posts.length} sample posts`);

    console.log('\n📊 Sample Data Summary:');
    console.log(`   - LinkedIn: ${posts.filter(p => p.platform === 'LinkedIn').length}`);
    console.log(`   - Twitter: ${posts.filter(p => p.platform === 'Twitter').length}`);
    console.log(`   - Instagram: ${posts.filter(p => p.platform === 'Instagram').length}`);
    console.log(`   - Facebook: ${posts.filter(p => p.platform === 'Facebook').length}`);
    console.log(`   - Published: ${posts.filter(p => p.status === 'published').length}`);
    console.log(`   - Draft: ${posts.filter(p => p.status === 'draft').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

/* ---------------- Run only when executed directly ---------------- */
if (require.main === module) {
  const forceSeed = process.env.FORCE_SEED === 'true';
  seedDatabase({ force: forceSeed });
}

module.exports = { samplePosts, seedDatabase };