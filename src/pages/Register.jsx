import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import "./CSS/Register.css";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const { loginWithRedirect } = useAuth0();

  const handleGoogleSignup = () =>
    loginWithRedirect({
      appState: {
        returnTo: "/home",
      },
      authorizationParams: {
        connection:
          import.meta.env.VITE_AUTH0_GOOGLE_CONNECTION || "google-oauth2",
        screen_hint: "signup",
      },
    });

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await api.post("/users/register", {
        fullName,
        username,
        email,
        password,
      });

      navigate("/login");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          "Backend register failed. Check if server and MongoDB are running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>

        {errorMsg && <p className="register-error">{errorMsg}</p>}

        <form onSubmit={submitHandler} className="register-form">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

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

          <button type="submit" disabled={loading} className="register-btn">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="google-auth-btn"
        >
          <span className="google-auth-icon">G</span>
          <span>Sign up with Google</span>
        </button>

        <p className="register-footer">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
