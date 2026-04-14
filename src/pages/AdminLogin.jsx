import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import UserContext from "../context/UserContext";
import api from "../api/axios.js";
import "./CSS/AdminRegister.css"; // reuse styling

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (accessKey !== "ADMIN2024") {
        throw new Error("Invalid Admin Access Key");
      }

      const res = await api.post("/users/login", {
        email,
        password,
        adminAccessKey: accessKey,
      });

      const { user, accessToken } = res.data.data;
      if (user.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      navigate("/admin");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        <p className="admin-note">Admin Access Key Required</p>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Admin Access Key"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          required
        />

        <button type="submit" disabled={loading} className="login-btn">
          {loading ? "Logging in..." : "Admin Login"}
        </button>

        <p className="login-footer">
          Back to <Link to="/login">User Login</Link>
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;

