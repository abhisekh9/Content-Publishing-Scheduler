import type { Post } from '../types';
import {
  getPlatformColor,
  formatEngagementRate,
  getStatusColor,
} from '../utils/csvExport';

interface PostListProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onPostDelete: (postId: string) => void;
}

const PostList = ({
  posts,
  onPostClick,
  onPostDelete,
}: PostListProps) => {
  const formatDate = (date?: Date) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const labels: Record<string, string> = {
      draft: '📝 Draft',
      scheduled: '⏰ Scheduled',
      published: '✅ Published',
    };

    return (
      <span
        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
        style={{ backgroundColor: getStatusColor(status) }}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      Twitter: '🐦',
      LinkedIn: '💼',
      Facebook: '👥',
      Instagram: '📸',
    };
    return icons[platform] || '📱';
  };

  const handleDragStart = (
    e: React.DragEvent,
    post: Post
  ) => {
    if (post.status === 'published') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('postId', post._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDelete = (
    e: React.MouseEvent,
    postId: string
  ) => {
    e.stopPropagation();
    if (
      window.confirm(
        'Are you sure you want to delete this post?'
      )
    ) {
      onPostDelete(postId);
    }
  };

  const groupedPosts = {
    scheduled: posts.filter(p => p.status === 'scheduled'),
    draft: posts.filter(p => p.status === 'draft'),
    published: posts.filter(p => p.status === 'published'),
  };

  const PostCard = (post: Post) => (
    <div
      key={post._id}
      draggable={post.status !== 'published'}
      onDragStart={e => handleDragStart(e, post)}
      onClick={() => onPostClick(post)}
      className="cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {/* HEADER */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-gray-800">
            {post.title}
          </h4>
          <div className="mt-1 flex items-center gap-2">
            {getStatusBadge(post.status)}
          </div>
        </div>

        <span
          className="rounded-md px-2 py-1 text-xs font-medium text-white"
          style={{
            backgroundColor: getPlatformColor(post.platform),
          }}
        >
          {getPlatformIcon(post.platform)} {post.platform}
        </span>
      </div>

      {/* CONTENT */}
      <p className="mb-3 text-sm text-gray-600">
        {post.content.length > 150
          ? post.content.slice(0, 150) + '...'
          : post.content}
      </p>

      {/* META */}
      <div className="mb-2 text-xs text-gray-500">
        {post.status === 'published'
          ? `📅 Published: ${formatDate(
              post.publishedTime
            )}`
          : `⏰ Scheduled: ${formatDate(
              post.scheduledTime
            )}`}
      </div>

      {/* ENGAGEMENT */}
      {post.status === 'published' && (
        <>
          <div className="mb-2 text-sm font-medium text-green-600">
            📊 Engagement:{' '}
            {formatEngagementRate(post.engagementScore)}
          </div>

          <div className="mb-3 grid grid-cols-4 gap-2 text-xs text-gray-600">
            <div>❤️ {post.metrics.likes}</div>
            <div>🔄 {post.metrics.shares}</div>
            <div>💬 {post.metrics.comments}</div>
            <div>👁️ {post.metrics.impressions}</div>
          </div>
        </>
      )}

      {/* AI SUGGESTION */}
      {post.aiSuggestedHeadline && (
        <div className="mb-3 rounded-md bg-indigo-50 p-2 text-xs text-indigo-700">
          🤖 AI: {post.aiSuggestedHeadline}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-2">
        <button
          className="rounded-md border px-3 py-1 text-xs hover:bg-gray-100"
          onClick={e => {
            e.stopPropagation();
            onPostClick(post);
          }}
        >
          ✏️ Edit
        </button>

        <button
          className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
          onClick={e => handleDelete(e, post._id)}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          📋 All Posts
        </h2>
        <div className="flex gap-2 text-sm text-gray-600">
          <span>Total: {posts.length}</span>
          <span>Drafts: {groupedPosts.draft.length}</span>
          <span>
            Scheduled: {groupedPosts.scheduled.length}
          </span>
          <span>
            Published: {groupedPosts.published.length}
          </span>
        </div>
      </div>

      {/* EMPTY */}
      {posts.length === 0 && (
        <div className="rounded-xl border bg-white p-8 text-center">
          <div className="text-4xl">📝</div>
          <h3 className="mt-2 font-semibold">
            No posts yet
          </h3>
          <p className="text-sm text-gray-500">
            Create your first post to get started
          </p>
          <button
            className="mt-3 rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => onPostClick({} as Post)}
          >
            ✨ Create Post
          </button>
        </div>
      )}

      {/* SECTIONS */}
      {groupedPosts.scheduled.length > 0 && (
        <section>
          <h3 className="mb-3 font-medium">
            ⏰ Scheduled
          </h3>
          <div className="grid gap-4">
            {groupedPosts.scheduled.map(PostCard)}
          </div>
        </section>
      )}

      {groupedPosts.draft.length > 0 && (
        <section>
          <h3 className="mb-3 font-medium">
            📝 Drafts
          </h3>
          <div className="grid gap-4">
            {groupedPosts.draft.map(PostCard)}
          </div>
        </section>
      )}

      {groupedPosts.published.length > 0 && (
        <section>
          <h3 className="mb-3 font-medium">
            ✅ Published
          </h3>
          <div className="grid gap-4">
            {groupedPosts.published
              .sort(
                (a, b) =>
                  new Date(b.publishedTime!).getTime() -
                  new Date(a.publishedTime!).getTime()
              )
              .map(PostCard)}
          </div>
        </section>
      )}
    </div>
  );
};

export default PostList;
