import { useState, useEffect } from 'react';
import type { Post } from '../types';
import { aiAPI } from '../services/api';

interface ScheduleFormProps {
  post?: Post | null;
  onSave: (post: Partial<Post>) => void;
  onCancel: () => void;
}

const ScheduleForm = ({ post, onSave, onCancel }: ScheduleFormProps) => {
  const [formData, setFormData] = useState<Partial<Post>>({
    title: '',
    content: '',
    platform: 'Twitter',
    scheduledTime: undefined,
    status: 'draft',
  });

  const [headlineSuggestions, setHeadlineSuggestions] = useState<string[]>([]);
  const [loadingHeadlines, setLoadingHeadlines] = useState(false);

  /* ---------------- LOAD POST ---------------- */
  useEffect(() => {
    if (!post) return;

    setFormData({
      title: post.title || '',
      content: post.content || '',
      platform: post.platform || 'Twitter',
      scheduledTime: post.scheduledTime,
      status: post.status || 'draft',
    });
  }, [post]);

  /* ---------------- AI HEADLINES ---------------- */
  const handleGenerateHeadlines = async () => {
    if (!formData.content || !formData.platform) return;

    try {
      setLoadingHeadlines(true);
      const res = await aiAPI.generateHeadlines(
        formData.content.slice(0, 100),
        formData.platform
      );

      setHeadlineSuggestions(res.data.data || []);
    } catch (error) {
      console.error('Failed to generate headlines:', error);
      alert('Failed to generate headlines');
    } finally {
      setLoadingHeadlines(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.platform) {
      alert('Please fill all required fields');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="schedule-form-overlay">
      <div className="schedule-form">
        <h2>{post ? 'Edit Post' : 'Create New Post'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              rows={4}
              value={formData.content}
              onChange={e =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Platform *</label>
            <select
              value={formData.platform}
              onChange={e =>
                setFormData({
                  ...formData,
                  platform: e.target.value as Post['platform'],
                })
              }
            >
              <option value="Twitter">Twitter</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
            </select>
          </div>

          <div className="form-group">
            <label>Scheduled Time</label>
            <input
              type="datetime-local"
              value={
                formData.scheduledTime
                  ? new Date(formData.scheduledTime)
                      .toISOString()
                      .slice(0, 16)
                  : ''
              }
              onChange={e =>
                setFormData({
                  ...formData,
                  scheduledTime: e.target.value
                    ? new Date(e.target.value)
                    : undefined,
                  status: e.target.value ? 'scheduled' : 'draft',
                })
              }
            />
          </div>

          {/* AI Headlines */}
          <div className="ai-headline-section">
            <button
              type="button"
              className="btn-generate-headlines"
              onClick={handleGenerateHeadlines}
              disabled={loadingHeadlines}
            >
              {loadingHeadlines ? 'Generating...' : '🤖 Generate AI Headlines'}
            </button>

            {headlineSuggestions.length > 0 && (
              <div className="headline-suggestions">
                <p>AI Suggested Headlines:</p>
                {headlineSuggestions.map((headline, i) => (
                  <div
                    key={i}
                    className="headline-option"
                    onClick={() => {
                      if (window.confirm('Use this headline?')) {
                        setFormData({ ...formData, title: headline });
                      }
                    }}
                  >
                    {headline}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {post ? 'Update' : 'Create'} Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;
