import type{ Post } from '../types';
import { getPlatformColor, formatEngagementRate, getStatusColor } from '../utils/csvExport';

interface PostListProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onPostDelete: (postId: string) => void;
}

const PostList = ({ posts, onPostClick, onPostDelete }: PostListProps) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const labels: Record<string, string> = {
      draft: '📝 DRAFT',
      scheduled: '⏰ SCHEDULED',
      published: '✅ PUBLISHED'
    };
    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: getStatusColor(status) }}
      >
        {labels[status] || status.toUpperCase()}
      </span>
    );
  };

  const getPlatformIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      'Twitter': '🐦',
      'LinkedIn': '💼',
      'Facebook': '👥',
      'Instagram': '📸'
    };
    return icons[platform] || '📱';
  };

  const handleDragStart = (e: React.DragEvent, post: Post) => {
    // Only allow dragging if not published
    if (post.status === 'published') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('postId', post._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDelete = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      onPostDelete(postId);
    }
  };

  // Group posts by status
  const groupedPosts = {
    draft: posts.filter(p => p.status === 'draft'),
    scheduled: posts.filter(p => p.status === 'scheduled'),
    published: posts.filter(p => p.status === 'published')
  };

  const renderPostCard = (post: Post) => (
    <div
      key={post._id}
      className="post-item"
      draggable={post.status !== 'published'}
      onDragStart={(e) => handleDragStart(e, post)}
      onClick={() => onPostClick(post)}
    >
      <div className="post-header">
        <div className="post-title-section">
          <h4 className="post-title">{post.title}</h4>
          {getStatusBadge(post.status)}
        </div>
        <div
          className="platform-badge"
          style={{ backgroundColor: getPlatformColor(post.platform) }}
        >
          {getPlatformIcon(post.platform)} {post.platform}
        </div>
      </div>

      <p className="post-content">
        {post.content.length > 150 
          ? post.content.substring(0, 150) + '...' 
          : post.content}
      </p>

      <div className="post-meta">
        <div className="meta-item">
          <span className="meta-label">
            {post.status === 'published' ? '📅 Published:' : '⏰ Scheduled:'}
          </span>
          <span className="meta-value">
            {formatDate(post.publishedTime || post.scheduledTime)}
          </span>
        </div>
        {post.status === 'published' && (
          <div className="meta-item">
            <span className="meta-label">📊 Engagement:</span>
            <span className="meta-value engagement-score">
              {formatEngagementRate(post.engagementScore)}
            </span>
          </div>
        )}
      </div>

      {post.status === 'published' && (
        <div className="post-metrics">
          <div className="metric-item">
            <span className="metric-icon">❤️</span>
            <span className="metric-value">{post.metrics.likes.toLocaleString()}</span>
          </div>
          <div className="metric-item">
            <span className="metric-icon">🔄</span>
            <span className="metric-value">{post.metrics.shares.toLocaleString()}</span>
          </div>
          <div className="metric-item">
            <span className="metric-icon">💬</span>
            <span className="metric-value">{post.metrics.comments.toLocaleString()}</span>
          </div>
          <div className="metric-item">
            <span className="metric-icon">👁️</span>
            <span className="metric-value">{post.metrics.impressions.toLocaleString()}</span>
          </div>
        </div>
      )}

      {post.aiSuggestedHeadline && (
        <div className="ai-suggestion">
          <span className="ai-badge">🤖 AI</span>
          <span className="ai-text">{post.aiSuggestedHeadline}</span>
        </div>
      )}

      <div className="post-actions">
        <button 
          className="btn-edit"
          onClick={(e) => {
            e.stopPropagation();
            onPostClick(post);
          }}
        >
          ✏️ Edit
        </button>
        <button 
          className="btn-delete"
          onClick={(e) => handleDelete(e, post._id)}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="post-list">
      <div className="post-list-header">
        <h2>📋 All Posts</h2>
        <div className="post-count-badges">
          <span className="count-badge">Total: {posts.length}</span>
          <span className="count-badge draft">Drafts: {groupedPosts.draft.length}</span>
          <span className="count-badge scheduled">Scheduled: {groupedPosts.scheduled.length}</span>
          <span className="count-badge published">Published: {groupedPosts.published.length}</span>
        </div>
      </div>
      
      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No posts yet</h3>
          <p>Create your first post to get started!</p>
          <button className="btn-primary" onClick={() => onPostClick({} as Post)}>
            ✨ Create Post
          </button>
        </div>
      ) : (
        <div className="posts-sections">
          {/* Scheduled Posts */}
          {groupedPosts.scheduled.length > 0 && (
            <div className="posts-section">
              <h3 className="section-title">⏰ Scheduled ({groupedPosts.scheduled.length})</h3>
              <div className="posts-container">
                {groupedPosts.scheduled.map(renderPostCard)}
              </div>
            </div>
          )}

          {/* Draft Posts */}
          {groupedPosts.draft.length > 0 && (
            <div className="posts-section">
              <h3 className="section-title">📝 Drafts ({groupedPosts.draft.length})</h3>
              <div className="posts-container">
                {groupedPosts.draft.map(renderPostCard)}
              </div>
            </div>
          )}

          {/* Published Posts */}
          {groupedPosts.published.length > 0 && (
            <div className="posts-section">
              <h3 className="section-title">✅ Published ({groupedPosts.published.length})</h3>
              <div className="posts-container">
                {groupedPosts.published
                  .sort((a, b) => new Date(b.publishedTime!).getTime() - new Date(a.publishedTime!).getTime())
                  .map(renderPostCard)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="post-list-help">
        <p>💡 <strong>Quick Tips:</strong></p>
        <ul>
          <li>Click on any post to view or edit details</li>
          <li>Drag draft or scheduled posts to the calendar to reschedule</li>
          <li>Published posts cannot be edited or rescheduled</li>
        </ul>
      </div>
    </div>
  );
};

export default PostList;