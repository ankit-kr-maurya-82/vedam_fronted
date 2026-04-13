import React, { useState, useEffect, useContext } from 'react';
import UserContext from '../context/UserContext.js';
import { getAdminStats, getUsersList } from '../api/admin.js';
import "./CSS/AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(UserContext);

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

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
        <div className="tab-content">
          <h2>Stats</h2>
          <p>Total Users: {stats.totalUsers}</p>
          <p>Total Posts: {stats.totalPosts}</p>
        </div>
      )}

      {/* =========================
          USERS TABLE
      ========================= */}
      {activeTab === "users" && (
        <div className="tab-content">

          <button className="reload-btn" onClick={loadUsers}>
            🔄 Reload Users
          </button>

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