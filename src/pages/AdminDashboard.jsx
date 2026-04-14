import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../context/UserContext.js';
import { getAdminStats, getUsersList, deleteUser, getPostsList, deletePost } from '../api/admin.js';
import "./CSS/AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(UserContext);

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [deletingId, setDeletingId] = useState(null);
  const [posts, setPosts] = useState([]);

  /* =========================
     DELETE POST FUNCTION
  ========================= */
  const handleDeletePost = async (id) => {
    if (!window.confirm(`Delete post ${id.slice(-6)} permanently?`)) return;

    try {
      setDeletingId(id);
      await deletePost(id);
      loadPosts();
      alert('Post deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================
     DELETE USER FUNCTION
  ========================= */
  const handleDelete = async (id) => {
    if (!window.confirm(`Delete user ${id.slice(-6)} permanently?`)) return;

    try {
      setDeletingId(id);
      await deleteUser(id);
      loadUsers(); // Reload list
      alert('User deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================
     LOAD STATS
  ========================= */
  const loadStats = async () => {
    try {
      const { data } = await getAdminStats();
      setStats(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOAD POSTS
  ========================= */
  const loadPosts = async () => {
    try {
      const response = await getPostsList();
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Posts error:", error);
    }
  };

  /* =========================
     LOAD USERS
  ========================= */
  const loadUsers = async () => {
    try {
      const { data } = await getUsersList();
      console.log("USERS:", data);

      setUsers(data.data.users); // ✅ IMPORTANT

    } catch (error) {
      console.error("Users error:", error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="admin-dashboard">

      <h1>Admin Dashboard</h1>
      <p>Role: <b>{user?.role}</b></p>

      {/* Tabs */}
      <div className="tab-buttons">
        <button 
          className={activeTab === "posts" ? "active" : ""}
          onClick={() => {
            setActiveTab("posts");
            loadPosts();
          }}
        >
          Posts
        </button>
        <button 
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => setActiveTab("stats")}
        >
          Stats
        </button>

        <button 
          className={activeTab === "users" ? "active" : ""}
          onClick={() => {
            setActiveTab("users");
            loadUsers(); // 🔥 load users
          }}
        >
          Users
        </button>
        
      </div>

      {/* =========================
          STATS
      ========================= */}
{activeTab === "stats" && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <span className="stat-number">{stats.totalUsers || 0}</span>
          </div>
          <div className="stat-card">
            <h3>Total Posts</h3>
            <span className="stat-number">{stats.totalPosts || 0}</span>
          </div>
        </div>
      )}

      {/* =========================
          USERS TABLE
      ========================= */}
      {activeTab === "users" && (
        <div className="tab-content">
          <div className="table-header">
            <button className="reload-btn" onClick={loadUsers}>
              🔄 Reload Users
            </button>
            <input 
              type="text" 
              placeholder="Search users..." 
              className="search-input"
              onChange={(e) => {
                const term = e.target.value.toLowerCase();
                const filtered = users.filter(u => 
                  u.username.toLowerCase().includes(term) ||
                  u.email.toLowerCase().includes(term)
                );
                setUsers(filtered);
              }}
            />
          </div>

          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u._id.slice(-6)}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={u.role === "admin" ? "admin-badge" : "user-badge"}>
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <>
                        <button 
                          className="view-btn"
                          onClick={() => window.open(`/admin/user/${u._id}`, '_blank')}
                        >
                          View
                        </button>
                        {u.role !== 'admin' && (
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(u._id)}
                          >
                            Delete
                          </button>
                        )}
                      </>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      )}
      {activeTab === "posts" && (
        <div className="tab-content">
          <div className="table-header">
            <button className="reload-btn" onClick={loadPosts}>
              🔄 Reload Posts
            </button>
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="search-input"
              onChange={(e) => {
                const term = e.target.value.toLowerCase();
                const filtered = posts.filter(p => 
                  p.title.toLowerCase().includes(term)
                );
                setPosts(filtered);
              }}
            />
          </div>
          {posts.length === 0 ? (
            <p>No posts found</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p._id}>
                    <td>{p._id.slice(-6)}</td>
                    <td>{p.title}</td>
                    <td>{p.owner?.username || 'Unknown'}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeletePost(p._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
