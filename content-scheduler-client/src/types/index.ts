export interface Post {
  _id: string;
  title: string;
  content: string;
  platform: 'Twitter' | 'LinkedIn' | 'Facebook' | 'Instagram';
  scheduledTime?: Date;
  publishedTime?: Date;
  status: 'draft' | 'scheduled' | 'published';
  aiSuggestedHeadline?: string;
  aiSuggestedTime?: Date;
  engagementScore: number;
  metrics: {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
    impressions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Metric interface for engagement tracking
 */
export interface Metric {
  _id: string;
  postId: string;
  timestamp: Date;
  platform: string;
  engagementRate: number;
  reach: number;
  hourOfDay: number;
  dayOfWeek: number;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  location?: string;
}

/**
 * Optimal time recommendation from AI
 */
export interface OptimalTime {
  hour: number;
  dayOfWeek: number;
  reason: string;
  predictedEngagement: number;
}

/**
 * AI Analysis results
 */
export interface AIAnalysis {
  optimalTimes: OptimalTime[];
  contentPatterns: string[];
  platformInsights: Record<string, string>;
  recommendations: string;
}

/**
 * Engagement data from analytics
 */
export interface EngagementData {
  _id: {
    hourOfDay: number;
    dayOfWeek: number;
    platform: string;
  };
  avgEngagement: number;
  totalPosts: number;
  avgLikes: number;
  avgShares: number;
  avgComments: number;
  avgClicks: number;
  avgImpressions: number;
}

/**
 * Platform-specific metrics
 */
export interface PlatformMetric {
  _id: string;
  totalPosts: number;
  avgEngagement: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalClicks: number;
  totalImpressions: number;
}

/**
 * Trend data over time
 */
export interface TrendData {
  _id: {
    date: string;
    platform: string;
  };
  avgEngagement: number;
  postCount: number;
}

/**
 * Calendar event for FullCalendar
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    post: Post;
    status: string;
    platform: string;
  };
}

/**
 * API Response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Form data for creating/editing posts
 */
export interface PostFormData {
  title: string;
  content: string;
  platform: Post['platform'];
  scheduledTime?: Date;
  status: Post['status'];
}