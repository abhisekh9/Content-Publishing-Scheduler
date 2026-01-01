import { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import type { AIAnalysis } from '../types';
import { getDayName, getHourFormat } from '../utils/csvExport';

interface AIRecommendationsProps {
  selectedPlatform?: string;
}

const AIRecommendations = ({ selectedPlatform }: AIRecommendationsProps) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform || 'all']);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await aiAPI.getOptimalTimes(
        selectedPlatform || undefined
      );

      setAnalysis(res.data.data || null);
    } catch (err: any) {
      console.error('AI API Error:', err);
      setError(
        err.response?.data?.error ||
          'Failed to fetch AI recommendations'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">
          🤖 AI Insights
        </h3>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
          <span>Analyzing your data...</span>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h3 className="text-lg font-semibold mb-2">
          🤖 AI Insights
        </h3>
        <p className="text-sm text-red-600 mb-3">
          {error}
        </p>
        <button
          onClick={fetchRecommendations}
          className="rounded-md border border-red-300 bg-white px-3 py-1 text-sm hover:bg-red-100"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  /* ---------------- EMPTY ---------------- */
  if (!analysis || !analysis.optimalTimes?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
        <h3 className="text-lg font-semibold mb-2">
          🤖 AI Insights
        </h3>
        <div className="text-3xl mb-2">📊</div>
        <p className="text-sm text-gray-600">
          Publish at least 5 high-engagement posts to unlock AI insights.
        </p>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          🤖 AI-Powered Insights
        </h3>
        <button
          onClick={fetchRecommendations}
          title="Refresh insights"
          className="rounded-md border px-2 py-1 text-sm hover:bg-gray-100"
        >
          🔄
        </button>
      </div>

      {/* BEST TIMES */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold mb-2">
          ⏰ Best Times to Post
        </h4>

        <div className="space-y-3">
          {analysis.optimalTimes.slice(0, 3).map((time, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 p-3 text-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">
                  #{i + 1} · {getDayName(time.dayOfWeek)}
                </span>
                <span className="text-xs text-gray-500">
                  {getHourFormat(time.hour)}
                </span>
              </div>

              <div className="mb-1 text-gray-700">
                {time.predictedEngagement}% predicted engagement
              </div>

              <p className="text-xs text-gray-500">
                {time.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT PATTERNS */}
      {analysis.contentPatterns?.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold mb-2">
            📊 High-Performing Patterns
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {analysis.contentPatterns.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* PLATFORM INSIGHTS */}
      {analysis.platformInsights &&
        Object.entries(analysis.platformInsights).length > 0 && (
          <div className="mb-5">
            <h4 className="text-sm font-semibold mb-2">
              🎯 Platform Insights
            </h4>

            <div className="space-y-3">
              {Object.entries(analysis.platformInsights).map(
                ([platform, insight]) => (
                  <div
                    key={platform}
                    className="rounded-lg border border-gray-200 p-3 text-sm"
                  >
                    <div className="font-medium mb-1">
                      {getPlatformIcon(platform)} {platform}
                    </div>
                    <p className="text-gray-600">
                      {insight}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

      {/* OVERALL */}
      {analysis.recommendations && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          <strong>💡 AI Recommendation</strong>
          <p className="mt-1">
            {analysis.recommendations}
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Last updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

const getPlatformIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    Twitter: '🐦',
    LinkedIn: '💼',
    Facebook: '👥',
    Instagram: '📸',
  };
  return icons[platform] || '📱';
};

export default AIRecommendations;
