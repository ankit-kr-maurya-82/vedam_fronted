import React, { useState } from 'react';
import api from '../api/axios.js';
import "./CSS/AdminRegister.css";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      formData.adminAccessKey = 'ADMIN2024';
      await api.post('/users/register', formData, {
        headers: { 'Content-Type': 'application/json' }
      });

      alert(`Admin registered!\nID: ${formData.username}\nPassword: ${formData.password}`);
      window.location.href = '/login';

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-container">
      <div className="admin-auth-card">

        <div className="admin-badge">🔐 DEVELOPER PANEL</div>
        <h2 className="admin-title">Admin Dashboard Access</h2>

        {error && <p className="admin-error">{error}</p>}

        <form className="admin-register-form" onSubmit={handleSubmit}>

          {/* Full Name */}
          <input
            className="admin-input"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          {/* Username */}
          <input
            className="admin-input"
            name="username"
            placeholder="Username (Developer ID)"
            value={formData.username}
            onChange={handleChange}
            required
          />

          {/* ✅ FIXED EMAIL */}
          <input
            className="admin-input"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* ✅ FIXED PASSWORD */}
          <input
            className="admin-input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Button */}
          <button 
            className="admin-btn"
            type="submit" 
            disabled={loading}
          >
            {loading ? '🚀 Creating Admin...' : '🔐 Create Developer Admin'}
          </button>

        </form>

        <p className="admin-footer">
          © {new Date().getFullYear()} Developer Admin Panel
        </p>

      </div>
    </div>
  );
};

export default AdminRegister;