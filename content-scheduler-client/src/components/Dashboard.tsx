import { useState, useEffect } from 'react';
import Calendar from './Calendar';
import MetricsChart from './MetricsChart';
import PostList from './PostList';
import AIRecommendations from './AIRecommendations';
import ScheduleForm from './ScheduleForm';
import type{ Post } from '../types';
import { postsAPI } from '../services/api';
import { exportToCSV } from '../utils/csvExport';

const Dashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState<'calendar' | 'list' | 'metrics'>('calendar');
  const [filterPlatform, setFilterPlatform] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

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
      setPosts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePost = async (postData: Partial<Post>) => {
    try {
      if (selectedPost) {
        await postsAPI.update(selectedPost._id, postData);
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

  const handleDeletePost = async (postId: string) => {
    try {
      await postsAPI.deletePost(postId);
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleEventDrop = async (postId: string, newDate: Date) => {
    try {
      await postsAPI.updatePost(postId, { 
        scheduledTime: newDate,
        status: 'scheduled'
      });
      fetchPosts();
    } catch (error) {
      throw error;
    }
  };

  const handleExportCSV = () => {
    const scheduledPosts = posts.filter(p => p.status === 'scheduled');
    exportToCSV(scheduledPosts, `scheduled-posts-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📅 Content Publishing Scheduler</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New Post
          </button>
          <button className="btn-secondary" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
        </div>
      </header>

      <div className="dashboard-filters">
        <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
          <option value="">All Platforms</option>
          <option value="Twitter">Twitter</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="view-tabs">
        <button
          className={activeView === 'calendar' ? 'active' : ''}
          onClick={() => setActiveView('calendar')}
        >
          📅 Calendar
        </button>
        <button
          className={activeView === 'list' ? 'active' : ''}
          onClick={() => setActiveView('list')}
        >
          📋 List
        </button>
        <button
          className={activeView === 'metrics' ? 'active' : ''}
          onClick={() => setActiveView('metrics')}
        >
          📊 Metrics
        </button>
      </div>

      <div className="dashboard-content">
        <div className="main-content">
          {activeView === 'calendar' && (
            <Calendar
              posts={posts}
              onEventDrop={handleEventDrop}
              onEventClick={(post) => {
                setSelectedPost(post);
                setShowForm(true);
              }}
              onDateClick={(date) => {
                setSelectedPost({ scheduledTime: date } as Post);
                setShowForm(true);
              }}
            />
          )}

          {activeView === 'list' && (
            <PostList
              posts={posts}
              onPostClick={(post) => {
                setSelectedPost(post);
                setShowForm(true);
              }}
              onPostDelete={handleDeletePost}
            />
          )}

          {activeView === 'metrics' && <MetricsChart />}
        </div>

        <aside className="sidebar">
          <AIRecommendations selectedPlatform={filterPlatform} />
        </aside>
      </div>

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
