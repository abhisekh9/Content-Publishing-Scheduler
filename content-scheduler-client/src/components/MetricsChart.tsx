import { useEffect, useState, useMemo } from 'react';
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
import type { TrendData, PlatformMetric } from '../types';
import { getPlatformColor, formatNumber } from '../utils/csvExport';

const MetricsChart = () => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  /* ---------------- FETCH ---------------- */
  const fetchMetrics = async (days = 30) => {
    try {
      setLoading(true);
      setError(null);

      const [trendsRes, platformRes] = await Promise.all([
        metricsAPI.getTrends(days),
        metricsAPI.getPlatformStats(),
      ]);

      setTrends(trendsRes.data.data || []);
      setPlatformStats(platformRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- TREND DATA ---------------- */
  const trendChartData = useMemo(() => {
    if (!trends.length) return [];

    const grouped = trends.reduce<Record<string, any>>((acc, trend) => {
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

      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a: any, b: any) =>
        new Date(a.rawDate).getTime() -
        new Date(b.rawDate).getTime()
    );
  }, [trends]);

  /* ---------------- PLATFORM DATA ---------------- */
  const platformChartData = useMemo(
    () =>
      platformStats.map(stat => ({
        platform: stat._id,
        engagement: Number(stat.avgEngagement.toFixed(2)),
        posts: stat.totalPosts,
        totalInteractions:
          stat.totalLikes + stat.totalShares + stat.totalComments,
      })),
    [platformStats]
  );

  const engagementDistribution = useMemo(
    () =>
      platformStats.map(stat => ({
        name: stat._id,
        value:
          stat.totalLikes +
          stat.totalShares +
          stat.totalComments,
        color: getPlatformColor(stat._id),
      })),
    [platformStats]
  );

  /* ---------------- TOOLTIP ---------------- */
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {formatNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  /* ---------------- STATES ---------------- */
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
        <button onClick={() => fetchMetrics()} className="btn-retry">
          🔄 Retry
        </button>
      </div>
    );
  }

  if (!platformStats.length) {
    return (
      <div className="metrics-empty">
        <h3>📊 No Analytics Data Yet</h3>
        <p>Publish posts to see analytics.</p>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="metrics-container">
      <div className="metrics-header">
        <h2>📊 Analytics Dashboard</h2>
        <button onClick={() => fetchMetrics()} className="btn-refresh">
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
        {trendChartData.length ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: '% Engagement', angle: -90, position: 'insideLeft' }} />
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
        ) : (
          <p className="no-data">No trend data available.</p>
        )}
      </div>

      {/* Bar + Pie */}
      <div className="charts-row">
        <div className="chart-half">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="engagement" name="Avg Engagement %" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-half">
          <ResponsiveContainer width="100%" height={300}>
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
                {engagementDistribution.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MetricsChart;
