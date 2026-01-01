export const exportToCSV = (posts: Post[], filename: string = 'scheduled-posts.csv') => {
  // Define CSV headers
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
    'AI Suggested Time'
  ];

  // Convert posts to CSV rows
  const rows = posts.map(post => [
    `"${post.title.replace(/"/g, '""')}"`, // Escape quotes in title
    post.platform,
    post.status,
    post.scheduledTime ? new Date(post.scheduledTime).toLocaleString() : '',
    post.publishedTime ? new Date(post.publishedTime).toLocaleString() : '',
    post.engagementScore.toFixed(2),
    post.metrics.likes,
    post.metrics.shares,
    post.metrics.comments,
    post.metrics.clicks,
    post.metrics.impressions,
    post.aiSuggestedHeadline ? `"${post.aiSuggestedHeadline.replace(/"/g, '""')}"` : '',
    post.aiSuggestedTime ? new Date(post.aiSuggestedTime).toLocaleString() : ''
  ]);

  // Combine headers and rows into CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\\n');

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Get day name from day number (0-6)
 */
export const getDayName = (dayNumber: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
};

/**
 * Format hour in 12-hour format with AM/PM
 */
export const getHourFormat = (hour: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
};

/**
 * Format engagement rate as percentage
 */
export const formatEngagementRate = (rate: number): string => {
  return `${rate.toFixed(2)}%`;
};

/**
 * Get color code for each platform
 */
export const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    'Twitter': '#1DA1F2',
    'LinkedIn': '#0A66C2',
    'Facebook': '#1877F2',
    'Instagram': '#E4405F'
  };
  return colors[platform] || '#6B7280';
};

/**
 * Calculate total engagement from metrics
 */
export const calculateTotalEngagement = (metrics: Post['metrics']): number => {
  return metrics.likes + metrics.shares + metrics.comments + metrics.clicks;
};

/**
 * Format large numbers with K/M suffix
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'draft': '#6B7280',
    'scheduled': '#F59E0B',
    'published': '#10B981'
  };
  return colors[status] || '#6B7280';
};
