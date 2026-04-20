import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAdminUserDetail } from '../api/admin.js';
import './CSS/AdminUserDetail.css';

const AdminUserDetail = () => {
  const { id } = useParams();
  
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

  if (loading) return <div className="admin-dashboard">Loading user details...</div>;
  if (error) return <div className="admin-dashboard">Error: {error}</div>;

  const { user, articles, postsCount, followersCount } = detail;

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
          <h3>Articles</h3>
          <span className="stat-number">{postsCount}</span>
        </div>
        <div className="stat-card">
          <h3>Followers</h3>
          <span className="stat-number">{followersCount}</span>
        </div>
        <div className="stat-card">
          <h3>Member Since</h3>
          <span className="stat-number">{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="user-bio-section">
        <h3>Bio</h3>
        <p>{user.bio || 'No bio available'}</p>
      </div>

      <div className="user-articles-section">
        <h3>Recent Articles ({articles?.length || 0})</h3>
        {articles && articles.length > 0 ? (
          <div className="articles-list">
            {articles.slice(0, 5).map(article => (
              <div key={article._id} className="article-card">
                <h4>{article.title}</h4>
                <p className="article-author">by {article.owner.username}</p>
                <p className="article-date">{new Date(article.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No articles</p>
        )}
      </div>

      <div className="user-meta">
        <p><strong>Last Active:</strong> {new Date(user.updatedAt).toLocaleString()}</p>
        <p><strong>User ID:</strong> {user._id}</p>
      </div>
    </div>
  );
};

export default AdminUserDetail;

