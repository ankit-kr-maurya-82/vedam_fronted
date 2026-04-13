import React, { useState, useEffect, useContext } from 'react';
// import UserContext from '../../context/UserContext.js';
import UserContext from '../context/UserContext.js';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  getAdminStats,
  getUsersList,
  deleteUser,
  getPostsList,
  deletePost,
  updateSelfRole
} from '../api/admin.js';
import './CSS/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, setUser } = useContext(UserContext);

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(user?.role || 'user');
  const [activeTab, setActiveTab] = useState('stats');

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Sync role when user updates
  useEffect(() => {
    if (user?.role) setRole(user.role);
  }, [user]);

  // Auto-load users/posts on tab change
  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'posts') loadPosts();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const { data } = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await getUsersList(1, 10);
      setUsers(data.users);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const { data } = await getPostsList(1, 10);
      setPosts(data.posts);
    } catch (error) {
      console.error('Load posts error:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete user?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch {
      alert('Delete failed');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete post?')) return;
    try {
      await deletePost(id);
      setPosts(posts.filter(p => p._id !== id));
    } catch {
      alert('Delete failed');
    }
  };

  const handleSetRole = async () => {
    try {
      const { data } = await updateSelfRole(role);
      setUser(data);
      alert('Role updated!');
    } catch {
      alert('Role update failed');
    }
  };

  const chartData = [
    { name: 'Users', value: stats.totalUsers || 0 },
    { name: 'Posts', value: stats.totalPosts || 0 }
  ];

  // Loading UI
  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <header className="admin-header">
        <h1>Admin Dashboard</h1>

        {user && (
          <div className="role-section">
            <label>Current Role: {user.role}</label>

            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button onClick={handleSetRole}>Update Role</button>
          </div>
        )}
      </header>

      {/* TABS */}
      <div className="tab-buttons">
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>

        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>

        <button
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
      </div>

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="tab-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <span>{stats.totalUsers || 0}</span>
            </div>

            <div className="stat-card">
              <h3>Total Posts</h3>
              <span>{stats.totalPosts || 0}</span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="recent-section">
            <h3>Recent Users</h3>
            <ul>
              {stats.recentUsers?.length > 0 ? (
                stats.recentUsers.map((u) => (
                  <li key={u._id}>
                    {u.username} ({u.email})
                  </li>
                ))
              ) : (
                <li>No recent users</li>
              )}
            </ul>

            <h3>Recent Posts</h3>
            <ul>
              {stats.recentPosts?.length > 0 ? (
                stats.recentPosts.map((p) => (
                  <li key={p._id}>{p.title}</li>
                ))
              ) : (
                <li>No recent posts</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="tab-content">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>{u._id.slice(-8)}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td><strong>{u.role}</strong></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* POSTS TAB */}
      {activeTab === 'posts' && (
        <div className="tab-content">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Owner</th>
                <th>Likes</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {posts.length > 0 ? (
                posts.map((p) => (
                  <tr key={p._id}>
                    <td>{p._id.slice(-8)}</td>
                    <td>{p.title}</td>
                    <td>{p.owner?.username || 'Unknown'}</td>
                    <td>{p.likes?.length || 0}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeletePost(p._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No posts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;