import { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import type{ AIAnalysis } from '../types';
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
  }, [selectedPlatform]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiAPI.getOptimalTimes(selectedPlatform);
      setAnalysis(response.data.data);
    } catch (err: any) {
      console.error('AI API Error:', err);
      setError(err.response?.data?.error || 'Failed to fetch AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ai-recommendations loading">
        <div className="ai-header">
          <h3>🤖 AI Insights</h3>
        </div>
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Analyzing your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-recommendations error">
        <div className="ai-header">
          <h3>🤖 AI Insights</h3>
        </div>
        <div className="error-content">
          <p className="error-message">{error}</p>
          <button onClick={fetchRecommendations} className="btn-retry">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analysis || !analysis.optimalTimes || analysis.optimalTimes.length === 0) {
    return (
      <div className="ai-recommendations empty">
        <div className="ai-header">
          <h3>🤖 AI Insights</h3>
        </div>
        <div className="empty-content">
          <div className="empty-icon">📊</div>
          <h4>Not Enough Data</h4>
          <p>Publish at least 5 posts with good engagement to receive AI-powered insights and recommendations.</p>
          <div className="progress-indicator">
            <div className="progress-text">Keep posting to unlock AI features!</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-recommendations">
      <div className="ai-header">
        <h3>🤖 AI-Powered Insights</h3>
        <button className="btn-refresh-small" onClick={fetchRecommendations} title="Refresh insights">
          🔄
        </button>
      </div>

      {/* Optimal Posting Times */}
      <div className="recommendation-section">
        <h4 className="section-title">⏰ Best Times to Post</h4>
        <div className="optimal-times">
          {analysis.optimalTimes.slice(0, 3).map((time, index) => (
            <div key={index} className="time-card">
              <div className="time-rank-badge">#{index + 1}</div>
              <div className="time-details">
                <div className="time-day">{getDayName(time.dayOfWeek)}</div>
                <div className="time-hour">{getHourFormat(time.hour)}</div>
              </div>
              <div className="time-prediction">
                <div className="prediction-bar">
                  <div 
                    className="prediction-fill" 
                    style={{ width: `${time.predictedEngagement}%` }}
                  ></div>
                </div>
                <span className="prediction-value">{time.predictedEngagement}% engagement</span>
              </div>
              <p className="time-reason">{time.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Patterns */}
      {analysis.contentPatterns && analysis.contentPatterns.length > 0 && (
        <div className="recommendation-section">
          <h4 className="section-title">📊 High-Performing Patterns</h4>
          <ul className="pattern-list">
            {analysis.contentPatterns.map((pattern, index) => (
              <li key={index} className="pattern-item">
                <span className="pattern-bullet">✓</span>
                <span className="pattern-text">{pattern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Platform Insights */}
      {analysis.platformInsights && Object.keys(analysis.platformInsights).length > 0 && (
        <div className="recommendation-section">
          <h4 className="section-title">🎯 Platform Insights</h4>
          <div className="insights-grid">
            {Object.entries(analysis.platformInsights).map(([platform, insight]) => (
              <div key={platform} className="insight-card">
                <div className="insight-header">
                  <span className="platform-icon">{getPlatformIcon(platform)}</span>
                  <h5>{platform}</h5>
                </div>
                <p className="insight-text">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Recommendations */}
      {analysis.recommendations && (
        <div className="recommendation-section">
          <h4 className="section-title">💡 AI Recommendations</h4>
          <div className="recommendations-box">
            <p className="recommendations-text">{analysis.recommendations}</p>
          </div>
        </div>
      )}

      {/* AI Footer */}
      <div className="ai-footer">
        <small>Last updated: {new Date().toLocaleTimeString()}</small>
      </div>
    </div>
  );
};

// Helper function for platform icons
const getPlatformIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    'Twitter': '🐦',
    'LinkedIn': '💼',
    'Facebook': '👥',
    'Instagram': '📸'
  };
  return icons[platform] || '📱';
};

export default AIRecommendations;