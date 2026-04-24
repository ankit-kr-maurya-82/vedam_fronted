import React, { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../context/UserContext.js";
import {
  deleteComment,
  deletePost,
  deleteUser,
  getAdminStats,
  getCommentsList,
  getPostsList,
  getUsersList,
} from "../api/admin.js";
import "./CSS/AdminDashboard.css";

const ADMIN_LIST_LIMIT = "all";
const getSerialNumber = (index) => index + 1;
const getSerialSearch = (value) => {
  const normalizedValue = String(value || "").trim();

  if (!/^\d+$/.test(normalizedValue)) {
    return null;
  }

  const serialNumber = Number(normalizedValue);
  return serialNumber > 0 ? serialNumber : null;
};
const attachSerialNumbers = (items) =>
  items.map((item, index) => ({
    ...item,
    serialNumber: getSerialNumber(index),
  }));

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const [deletingId, setDeletingId] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [postSearch, setPostSearch] = useState("");
  const [commentSearch, setCommentSearch] = useState("");

  const formatDate = (value) => new Date(value).toLocaleDateString();

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await getAdminStats();
      setStats(data?.data || {});
    } catch (error) {
      console.error("Stats error:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async (search = "") => {
    setUsersLoading(true);
    try {
      const serialSearch = getSerialSearch(search);
      const { data } = await getUsersList(1, ADMIN_LIST_LIMIT, serialSearch ? "" : search);
      const fetchedUsers = attachSerialNumbers(data?.data?.users || []);
      setUsers(
        serialSearch ? fetchedUsers.filter((entry) => entry.serialNumber === serialSearch) : fetchedUsers
      );
    } catch (error) {
      console.error("Users error:", error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadPosts = useCallback(async (search = "") => {
    setPostsLoading(true);
    try {
      const serialSearch = getSerialSearch(search);
      const { data } = await getPostsList(1, ADMIN_LIST_LIMIT, serialSearch ? "" : search);
      const fetchedPosts = attachSerialNumbers(data?.data?.posts || []);
      setPosts(
        serialSearch ? fetchedPosts.filter((entry) => entry.serialNumber === serialSearch) : fetchedPosts
      );
    } catch (error) {
      console.error("Posts error:", error);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  const loadComments = useCallback(async (search = "") => {
    setCommentsLoading(true);
    try {
      const serialSearch = getSerialSearch(search);
      const { data } = await getCommentsList(
        1,
        ADMIN_LIST_LIMIT,
        serialSearch ? "" : search
      );
      const fetchedComments = attachSerialNumbers(data?.data?.comments || []);
      setComments(
        serialSearch
          ? fetchedComments.filter((entry) => entry.serialNumber === serialSearch)
          : fetchedComments
      );
    } catch (error) {
      console.error("Comments error:", error);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm(`Delete user ${id.slice(-6)} permanently?`)) return;

    try {
      setDeletingId(id);
      await deleteUser(id);
      await loadUsers(userSearch);
      alert("User deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm(`Delete post ${id.slice(-6)} permanently?`)) return;

    try {
      setDeletingId(id);
      await deletePost(id);
      await loadPosts(postSearch);
      await loadStats();
      alert("Post deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm(`Delete comment ${id.slice(-6)} permanently?`)) return;

    try {
      setDeletingId(id);
      await deleteComment(id);
      await loadComments(commentSearch);
      await loadStats();
      alert("Comment deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab !== "users") return;

    const timer = setTimeout(() => {
      loadUsers(userSearch);
    }, 250);

    return () => clearTimeout(timer);
  }, [activeTab, userSearch, loadUsers]);

  useEffect(() => {
    if (activeTab !== "posts") return;

    const timer = setTimeout(() => {
      loadPosts(postSearch);
    }, 250);

    return () => clearTimeout(timer);
  }, [activeTab, postSearch, loadPosts]);

  useEffect(() => {
    if (activeTab !== "comments") return;

    const timer = setTimeout(() => {
      loadComments(commentSearch);
    }, 250);

    return () => clearTimeout(timer);
  }, [activeTab, commentSearch, loadComments]);

  if (statsLoading) {
    return <h2 className="admin-loading">Loading...</h2>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>
        Role: <b>{user?.role}</b>
      </p>

      <div className="tab-buttons">
        <button
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => setActiveTab("stats")}
        >
          Stats
        </button>
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={activeTab === "posts" ? "active" : ""}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={activeTab === "comments" ? "active" : ""}
          onClick={() => setActiveTab("comments")}
        >
          Comments
        </button>
      </div>

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
          <div className="stat-card">
            <h3>Total Comments</h3>
            <span className="stat-number">{stats.totalComments || 0}</span>
          </div>
          <div className="stat-card">
            <h3>Total Likes</h3>
            <span className="stat-number">{stats.totalLikes || 0}</span>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="tab-content">
          <div className="table-header">
            <button className="reload-btn" onClick={() => loadUsers(userSearch)}>
              Reload Users
            </button>
            <input
              type="text"
              placeholder="Search by Sr. No., username, email, or full name..."
              className="search-input"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
            />
          </div>

          {usersLoading && <p className="admin-status">Searching users...</p>}
          {!usersLoading && users.length === 0 ? (
            <p>No users found</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.serialNumber}</td>
                    <td>{entry._id.slice(-6)}</td>
                    <td>{entry.username}</td>
                    <td>{entry.email}</td>
                    <td>
                      <span
                        className={entry.role === "admin" ? "admin-badge" : "user-badge"}
                      >
                        {entry.role}
                      </span>
                    </td>
                    <td>{formatDate(entry.createdAt)}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => window.open(`/admin/user/${entry._id}`, "_blank")}
                      >
                        View
                      </button>
                      {entry.role !== "admin" && (
                        <button
                          className="delete-btn"
                          disabled={deletingId === entry._id}
                          onClick={() => handleDeleteUser(entry._id)}
                        >
                          {deletingId === entry._id ? "Deleting..." : "Delete"}
                        </button>
                      )}
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
            <button className="reload-btn" onClick={() => loadPosts(postSearch)}>
              Reload Posts
            </button>
            <input
              type="text"
              placeholder="Search by Sr. No., title, content, or author..."
              className="search-input"
              value={postSearch}
              onChange={(event) => setPostSearch(event.target.value)}
            />
          </div>

          {postsLoading && <p className="admin-status">Searching posts...</p>}
          {!postsLoading && posts.length === 0 ? (
            <p>No posts found</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.serialNumber}</td>
                    <td>{entry._id.slice(-6)}</td>
                    <td className="admin-cell-copy">{entry.title}</td>
                    <td>{entry.owner?.username || "Unknown"}</td>
                    <td>{Array.isArray(entry.likes) ? entry.likes.length : 0}</td>
                    <td>{entry.commentsCount || 0}</td>
                    <td>{formatDate(entry.createdAt)}</td>
                    <td>
                      <button
                        className="delete-btn"
                        disabled={deletingId === entry._id}
                        onClick={() => handleDeletePost(entry._id)}
                      >
                        {deletingId === entry._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "comments" && (
        <div className="tab-content">
          <div className="table-header">
            <button className="reload-btn" onClick={() => loadComments(commentSearch)}>
              Reload Comments
            </button>
            <input
              type="text"
              placeholder="Search by Sr. No., comment, author, or post..."
              className="search-input"
              value={commentSearch}
              onChange={(event) => setCommentSearch(event.target.value)}
            />
          </div>

          {commentsLoading && <p className="admin-status">Searching comments...</p>}
          {!commentsLoading && comments.length === 0 ? (
            <p>No comments found</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>ID</th>
                  <th>Comment</th>
                  <th>Author</th>
                  <th>Post</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.serialNumber}</td>
                    <td>{entry._id.slice(-6)}</td>
                    <td className="admin-cell-copy">{entry.content}</td>
                    <td>{entry.owner?.username || entry.owner?.fullName || "Unknown"}</td>
                    <td className="admin-cell-copy">{entry.post?.title || "Unknown post"}</td>
                    <td>{formatDate(entry.createdAt)}</td>
                    <td>
                      <button
                        className="delete-btn"
                        disabled={deletingId === entry._id}
                        onClick={() => handleDeleteComment(entry._id)}
                      >
                        {deletingId === entry._id ? "Deleting..." : "Delete"}
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
