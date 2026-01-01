import { useState, useEffect } from 'react';
import type{ Post } from '../types';
import { aiAPI, postsAPI } from '../services/api';

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
    status: 'draft'
  });
  const [headlineSuggestions, setHeadlineSuggestions] = useState<string[]>([]);
  const [loadingHeadlines, setLoadingHeadlines] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData(post);
    }
  }, [post]);

  const handleGenerateHeadlines = async () => {
    if (!formData.content || !formData.platform) return;
    
    try {
      setLoadingHeadlines(true);
      const response = await aiAPI.generateHeadlines(
        formData.content.substring(0, 100),
        formData.platform
      );
      setHeadlineSuggestions(response.data.data.headlines || []);
    } catch (error) {
      console.error('Failed to generate headlines:', error);
    } finally {
      setLoadingHeadlines(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>Platform *</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
              required
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
              value={formData.scheduledTime ? new Date(formData.scheduledTime).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                scheduledTime: e.target.value ? new Date(e.target.value) : undefined,
                status: e.target.value ? 'scheduled' : 'draft'
              })}
            />
          </div>

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
                {headlineSuggestions.map((headline, index) => (
                  <div
                    key={index}
                    className="headline-option"
                    onClick={() => setFormData({ ...formData, title: headline })}
                  >
                    {headline}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
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
