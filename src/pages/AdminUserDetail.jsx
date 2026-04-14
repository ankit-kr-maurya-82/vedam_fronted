import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getAdminUserDetail } from '../api/admin.js';
import UserContext from '../context/UserContext.js';
import './CSS/AdminUserDetail.css';

const AdminUserDetail = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(UserContext);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await getAdminUserDetail(id);
        setDetail(response.data);
      } catch (err) {
        setError('Failed to load user details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // ✅ Admin protection
  if (currentUser?.role !== "admin") {
    return <div className="admin-dashboard">Access Denied</div>;
  }

  if (loading) return <div className="admin-dashboard">Loading user details...</div>;
  if (error) return <div className="admin-dashboard">Error: {error}</div>;
  if (!detail) return null;

  const { user, postsCount, followersCount } = detail;

  return (
    <div className="admin-dashboard">
      <div className="user-detail-header">
        <img 
          src={user.avatar || '/default-avatar.png'} 
          alt={user.username}
          className="user-avatar-large"
        />
        <div>
          <h1>@{user.username}</h1>
          <p>{user.fullName}</p>
          <p>{user.email}</p>
          <span className={user.role === 'admin' ? 'admin-badge' : 'user-badge'}>
            {user.role.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="user-stats-grid">
        <div className="stat-card">
          <h3>Posts</h3>
          <span className="stat-number">{postsCount}</span>
        </div>
        <div className="stat-card">
          <h3>Followers</h3>
          <span className="stat-number">{followersCount}</span>
        </div>
        <div className="stat-card">
          <h3>Member Since</h3>
          <span className="stat-number">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="user-bio-section">
        <h3>Bio</h3>
        <p>{user.bio || 'No bio available'}</p>
      </div>

      <div className="user-meta">
        <p><strong>Last Active:</strong> {new Date(user.updatedAt).toLocaleString()}</p>
        <p><strong>User ID:</strong> {user._id}</p>
      </div>
    </div>
  );
};

export default AdminUserDetail;