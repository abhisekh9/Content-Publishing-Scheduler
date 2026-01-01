import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

import { metricsAPI } from '../services/api';
import type{ TrendData, PlatformMetric } from '../types';
import { getPlatformColor, formatNumber } from '../utils/csvExport';

const MetricsChart = () => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trendsRes, platformRes] = await Promise.all([
        metricsAPI.getTrends(30),
        metricsAPI.getPlatformStats(),
      ]);

      setTrends(trendsRes.data.data);
      setPlatformStats(platformRes.data.data);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Trend Chart Data ---------------- */
  const trendChartData = Object.values(
    trends.reduce((acc: any, trend) => {
      const rawDate = trend._id.date;

      if (!acc[rawDate]) {
        acc[rawDate] = {
          rawDate,
          date: new Date(rawDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        };
      }

      acc[rawDate][trend._id.platform] = Number(
        trend.avgEngagement.toFixed(2)
      );
      acc[rawDate][`${trend._id.platform}_posts`] = trend.postCount;

      return acc;
    }, {})
  ).sort(
    (a: any, b: any) =>
      new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
  );

  /* ---------------- Platform Chart Data ---------------- */
  const platformChartData = platformStats.map(stat => ({
    platform: stat._id,
    engagement: Number(stat.avgEngagement.toFixed(2)),
    posts: stat.totalPosts,
    totalInteractions:
      stat.totalLikes + stat.totalShares + stat.totalComments,
  }));

  /* ---------------- Pie Chart Data ---------------- */
  const engagementDistribution = platformStats.map(stat => ({
    name: stat._id,
    value:
      stat.totalLikes + stat.totalShares + stat.totalComments,
    color: getPlatformColor(stat._id),
  }));

  /* ---------------- Tooltip ---------------- */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {Number.isFinite(entry.value)
                ? entry.value.toLocaleString()
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  /* ---------------- Loading / Error ---------------- */
  if (loading) {
    return (
      <div className="metrics-loading">
        <div className="spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics-error">
        <p>{error}</p>
        <button onClick={fetchMetrics} className="btn-retry">
          🔄 Retry
        </button>
      </div>
    );
  }

  if (!platformStats.length) {
    return (
      <div className="metrics-empty">
        <h3>📊 No Analytics Data Yet</h3>
        <p>Publish some posts to see your analytics dashboard!</p>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="metrics-container">
      <div className="metrics-header">
        <h2>📊 Analytics Dashboard</h2>
        <button onClick={fetchMetrics} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="metrics-cards">
        <div className="metric-card">
          <h3>
            {platformStats.reduce(
              (sum, s) => sum + s.totalPosts,
              0
            )}
          </h3>
          <p>Total Posts</p>
        </div>
        <div className="metric-card">
          <h3>
            {formatNumber(
              platformStats.reduce(
                (sum, s) => sum + s.totalLikes,
                0
              )
            )}
          </h3>
          <p>Total Likes</p>
        </div>
        <div className="metric-card">
          <h3>
            {formatNumber(
              platformStats.reduce(
                (sum, s) => sum + s.totalShares,
                0
              )
            )}
          </h3>
          <p>Total Shares</p>
        </div>
        <div className="metric-card">
          <h3>
            {formatNumber(
              platformStats.reduce(
                (sum, s) => sum + s.totalComments,
                0
              )
            )}
          </h3>
          <p>Total Comments</p>
        </div>
      </div>

      {/* Area Chart */}
      <div className="chart-section">
        <h3>📈 Engagement Trends (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={trendChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {platformStats.map(stat => (
              <Area
                key={stat._id}
                dataKey={stat._id}
                stroke={getPlatformColor(stat._id)}
                fill={getPlatformColor(stat._id)}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar + Pie */}
      <div className="charts-row">
        <ResponsiveContainer width="50%" height={300}>
          <BarChart data={platformChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="platform" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="engagement"
              name="Avg Engagement %"
              fill="#8884d8"
            />
          </BarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="50%" height={300}>
          <PieChart>
            <Pie
              data={engagementDistribution}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {engagementDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Stats */}
      <div className="platform-stats-section">
        {platformStats.map(stat => (
          <div
            key={stat._id}
            className="stat-card"
            style={{
              borderTop: `4px solid ${getPlatformColor(
                stat._id
              )}`,
            }}
          >
            <h4>{stat._id}</h4>
            <p>{stat.avgEngagement.toFixed(2)}% avg</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsChart;
