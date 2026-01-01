import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/* -------------------- POSTS API -------------------- */
export const postsAPI = {
  getPosts: (params?: any) =>
    axios.get(`${API_BASE_URL}/posts`, { params }),

  createPost: (data: any) =>
    axios.post(`${API_BASE_URL}/posts`, data),

  updatePost: (id: string, data: any) =>
    axios.put(`${API_BASE_URL}/posts/${id}`, data),

  deletePost: (id: string) =>
    axios.delete(`${API_BASE_URL}/posts/${id}`),
};

/* -------------------- AI API -------------------- */
export const aiAPI = {
  getOptimalTimes: (platform?: string) =>
    axios.get(`${API_BASE_URL}/ai/optimal-times`, {
      params: platform ? { platform } : {},
    }),

  generateHeadlines: (content: string, platform: string) =>
  axios.post(`${API_BASE_URL}/ai/headlines`, {
    content,
    platform,
  }),

};

/* -------------------- METRICS API -------------------- */
export const metricsAPI = {
  getTrends: (days: number) =>
    axios.get(`${API_BASE_URL}/metrics/trends`, {
      params: { days },
    }),

  getPlatformStats: () =>
    axios.get(`${API_BASE_URL}/metrics/platform-stats`),

  getEngagementMetrics: (dateRange: any) =>
    axios.get(`${API_BASE_URL}/metrics/engagement`, {
      params: dateRange,
    }),
};
