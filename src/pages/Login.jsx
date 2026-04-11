import React, { useContext, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import api from "../api/axios.js";
import "./CSS/Login.css";
import { syncUserToStore } from "../lib/socialStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { loginWithRedirect } = useAuth0();

  const handleGoogleLogin = () =>
    loginWithRedirect({
      appState: {
        returnTo: "/home",
      },
      authorizationParams: {
        connection:
          import.meta.env.VITE_AUTH0_GOOGLE_CONNECTION || "google-oauth2",
      },
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/users/login", {
        email,
        password,
      });

      const { user, accessToken } = res.data.data;
      const syncedUser = syncUserToStore(user);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(syncedUser));
      setUser(syncedUser);
      navigate(`/profile/${syncedUser.username}`);
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          "Backend login failed. Check if server and MongoDB are running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <input
          type="email"
          placeholder="Email"
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

        <button type="submit" disabled={loading} className="login-btn">
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="google-auth-btn"
        >
          <span className="google-auth-icon">G</span>
          <span>Sign in with Google</span>
        </button>

        <p className="login-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
