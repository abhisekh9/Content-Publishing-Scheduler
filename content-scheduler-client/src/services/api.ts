import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/* -------------------- POSTS API -------------------- */
export const postsAPI = {
  getPosts: () => axios.get(`${API_BASE_URL}/posts`),
  createPost: (data: any) =>
    axios.post(`${API_BASE_URL}/posts`, data),
  updatePost: (id: string, data: any) =>
    axios.put(`${API_BASE_URL}/posts/${id}`, data),
};

/* -------------------- AI API -------------------- */
export const aiAPI = {
  getOptimalTimes: () =>
    axios.get(`${API_BASE_URL}/ai/optimal-times`),

  generateHeadlines: (topic: string, platform: string) =>
    axios.post(`${API_BASE_URL}/ai/headlines`, {
      topic,
      platform,
    }),
};

/* -------------------- METRICS API (✅ REQUIRED) -------------------- */
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
