/* ---------------- CSV HELPERS ---------------- */

import type { Post } from "../types";

const sanitizeCSVCell = (value: string): string => {
  if (!value) return '';

  // Prevent CSV injection
  const dangerousStart = /^[=+\-@]/;
  const safeValue = dangerousStart.test(value)
    ? `'${value}`
    : value;

  return `"${safeValue.replace(/"/g, '""')}"`;
};

const safeDate = (date?: string | Date | null): string => {
  if (!date) return '';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '' : d.toLocaleString();
};

const safeNumber = (num?: number, decimals = 0): string => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return decimals ? num.toFixed(decimals) : num.toString();
};

/* ---------------- CSV EXPORT ---------------- */

export const exportToCSV = (
  posts: Post[],
  filename = 'scheduled-posts.csv'
) => {
  const headers = [
    'Title',
    'Platform',
    'Status',
    'Scheduled Time',
    'Published Time',
    'Engagement Score',
    'Likes',
    'Shares',
    'Comments',
    'Clicks',
    'Impressions',
    'AI Suggested Headline',
    'AI Suggested Time',
  ];

  const rows = posts.map(post => {
    const metrics = post.metrics || {
      likes: 0,
      shares: 0,
      comments: 0,
      clicks: 0,
      impressions: 0,
    };

    return [
      sanitizeCSVCell(post.title || ''),
      sanitizeCSVCell(post.platform || ''),
      sanitizeCSVCell(post.status || ''),
      safeDate(post.scheduledTime),
      safeDate(post.publishedTime),
      safeNumber(post.engagementScore, 2),
      safeNumber(metrics.likes),
      safeNumber(metrics.shares),
      safeNumber(metrics.comments),
      safeNumber(metrics.clicks),
      safeNumber(metrics.impressions),
      sanitizeCSVCell(post.aiSuggestedHeadline || ''),
      safeDate(post.aiSuggestedTime),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/* ---------------- FORMATTERS ---------------- */

export const getDayName = (dayNumber: number): string => {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[dayNumber] ?? 'Unknown';
};

export const getHourFormat = (hour: number): string => {
  if (hour < 0 || hour > 23) return '';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
};

export const formatEngagementRate = (rate?: number): string => {
  if (typeof rate !== 'number' || isNaN(rate)) return '0.00%';
  return `${rate.toFixed(2)}%`;
};

export const getPlatformColor = (platform?: string): string => {
  const normalized =
    platform?.charAt(0).toUpperCase() +
    platform?.slice(1).toLowerCase();

  const colors: Record<string, string> = {
    Twitter: '#1DA1F2',
    LinkedIn: '#0A66C2',
    Facebook: '#1877F2',
    Instagram: '#E4405F',
  };

  return colors[normalized] || '#6B7280';
};

export const calculateTotalEngagement = (
  metrics?: Post['metrics']
): number => {
  if (!metrics) return 0;
  return (
    (metrics.likes || 0) +
    (metrics.shares || 0) +
    (metrics.comments || 0) +
    (metrics.clicks || 0)
  );
};

export const formatNumber = (num?: number): string => {
  if (typeof num !== 'number' || isNaN(num)) return '0';

  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const getStatusColor = (status?: string): string => {
  const colors: Record<string, string> = {
    draft: '#6B7280',
    scheduled: '#F59E0B',
    published: '#10B981',
  };
  return colors[status || 'draft'] || '#6B7280';
};
