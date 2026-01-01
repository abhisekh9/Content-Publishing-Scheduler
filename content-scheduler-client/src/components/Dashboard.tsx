import { useState, useEffect } from 'react';
import Calendar from './Calendar';
import MetricsChart from './MetricsChart';
import PostList from './PostList';
import AIRecommendations from './AIRecommendations';
import ScheduleForm from './ScheduleForm';
import type { Post } from '../types';
import { postsAPI } from '../services/api';
import { exportToCSV } from '../utils/csvExport';

const Dashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);


  const [activeView, setActiveView] =
    useState<'calendar' | 'list' | 'metrics'>('calendar');

  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  /* ---------------- FETCH POSTS ---------------- */
  useEffect(() => {
    fetchPosts();
  }, [filterPlatform, filterStatus]);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const params: any = {};
      if (filterPlatform) params.platform = filterPlatform;
      if (filterStatus) params.status = filterStatus;

      const response = await postsAPI.getPosts(params);
      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SAVE POST ---------------- */
  const handleSavePost = async (postData: Partial<Post>) => {
    try {
      if (selectedPost?._id) {
        await postsAPI.updatePost(selectedPost._id, postData);
      } else {
        await postsAPI.createPost(postData);
      }

      fetchPosts();
      setShowForm(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

  /* ---------------- DELETE POST ---------------- */
  const handleDeletePost = async (postId: string) => {
    try {
      await postsAPI.deletePost(postId);
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  /* ---------------- DRAG & DROP ---------------- */
  const handleEventDrop = async (postId: string, newDate: Date) => {
    try {
      await postsAPI.updatePost(postId, {
        scheduledTime: newDate.toISOString(),
        status: 'scheduled',
      });
      fetchPosts();
    } catch (error) {
      console.error('Failed to reschedule post:', error);
    }
  };

  /* ---------------- CSV EXPORT ---------------- */
  const handleExportCSV = () => {
    const scheduledPosts = posts.filter(
      post => post.status === 'scheduled'
    );

    exportToCSV(
      scheduledPosts,
      `scheduled-posts-${new Date()
        .toISOString()
        .split('T')[0]}.csv`
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="dashboard">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight">
          📅 Content Publishing Scheduler
        </h1>

        <div className="flex gap-3">
          <button
            className="btn-primary"
            onClick={() => {
              setSelectedPost(null);
              setShowForm(true);
            }}
          >
            + New Post
          </button>

          <button
            className="btn-secondary"
            onClick={handleExportCSV}
          >
            📥 Export CSV
          </button>
        </div>
      </header>


      {/* FILTERS */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Platform
          </label>
          <select
            value={filterPlatform}
            onChange={e => setFilterPlatform(e.target.value)}
            className="min-w-[180px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Platforms</option>
            <option value="Twitter">Twitter</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="min-w-[180px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* VIEW TABS */}
      <div className="inline-flex rounded-xl border border-gray-300 bg-gray-50 p-1 mb-6">
        <button
          onClick={() => setActiveView('calendar')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition
            ${
              activeView === 'calendar'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
          📅 Calendar
        </button>

        <button
          onClick={() => setActiveView('list')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition
            ${
              activeView === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
          📋 List
        </button>

        <button
          onClick={() => setActiveView('metrics')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition
            ${
              activeView === 'metrics'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
          📊 Metrics
        </button>
      </div>


      {/* CONTENT */}
      <div className="dashboard-content">
        <div className="main-content">
          {activeView === 'calendar' && (
            <Calendar
              posts={posts}
              onEventDrop={handleEventDrop}
              onEventClick={post => {
                setSelectedPost(post);
                setShowForm(true);
              }}
              onDateClick={date => {
                setSelectedPost({
                  scheduledTime: date,
                } as Post);
                setShowForm(true);
              }}
            />
          )}

          {activeView === 'list' && (
            <PostList
              posts={posts}
              loading={loading}
              onPostClick={post => {
                setSelectedPost(post);
                setShowForm(true);
              }}
              onPostDelete={handleDeletePost}
            />
          )}

          {activeView === 'metrics' && <MetricsChart />}
        </div>

        {/* SIDEBAR */}
        <aside className="sidebar">
          <AIRecommendations selectedPlatform={filterPlatform} />
        </aside>
      </div>

      {/* MODAL */}
      {showForm && (
        <ScheduleForm
          post={selectedPost}
          onSave={handleSavePost}
          onCancel={() => {
            setShowForm(false);
            setSelectedPost(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
