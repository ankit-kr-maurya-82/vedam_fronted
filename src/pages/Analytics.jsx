import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaChartLine,
  FaEye,
  FaHeart,
  FaComments,
  FaStar,
  FaLock,
} from "react-icons/fa";
import UserContext from "../context/UserContext";
import { getUserAnalytics, upgradeToPremium } from "../api/profile";
import {
  getRazorpayKey,
  createPaymentOrder,
  verifyPayment,
} from "../api/payment.js";
import "./CSS/Analytics.css";

const Analytics = () => {
  const { user } = useContext(UserContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    setUpgrading(true);
    try {
      // Get Razorpay key
      const key = await getRazorpayKey();

      // Create payment order
      const order = await createPaymentOrder(user._id);

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        const options = {
          key: key,
          amount: order.amount,
          currency: order.currency,
          name: "Premium Subscription",
          description: "30-day Premium Plan - ₹99/month",
          order_id: order.id,
          prefill: {
            email: user.email,
            contact: user.phone || "",
          },
          handler: async (response) => {
            try {
              // Verify payment
              const result = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user._id,
              });

              toast.success("✨ Upgrade successful! Welcome to Premium");

              // Refresh analytics
              setTimeout(() => {
                const loadAnalytics = async () => {
                  try {
                    const data = await getUserAnalytics();
                    setAnalytics(data);
                  } catch (err) {
                    console.error("Failed to reload analytics:", err);
                  }
                };
                loadAnalytics();
                setUpgrading(false);
              }, 1500);
            } catch (err) {
              toast.error(
                err.response?.data?.message ||
                  err.message ||
                  "Payment verification failed"
              );
              setUpgrading(false);
            }
          },
          modal: {
            ondismiss: () => {
              toast.error("Payment cancelled");
              setUpgrading(false);
            },
          },
          theme: {
            color: "#4f46e5",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to initiate payment"
      );
      setUpgrading(false);
    }
  };

  if (!user) {
    return (
      <div className="analytics-page">
        <div className="analytics-login-warning">
          <h2>Sign in to view analytics</h2>
          <Link to="/login" className="analytics-login-link">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">Loading analytics...</div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <div className="analytics-lock-icon">
            <FaLock />
          </div>
          <h2>Premium Analytics</h2>
          <p>{error}</p>
          <button
            className="analytics-upgrade-btn"
            onClick={handleUpgrade}
            disabled={upgrading}
          >
            {upgrading ? "Upgrading..." : "Upgrade to Premium (₹99/month)"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <div className="analytics-topbar">
          <Link to="/home" className="analytics-back-link">
            <FaArrowLeft /> Back
          </Link>
          <h1 className="analytics-title">Analytics Dashboard</h1>
          <div className="analytics-plan-badge">
            <FaStar /> {analytics?.subscriptionPlan || "free"}
          </div>
        </div>

        <div className="analytics-hero">
          <div className="analytics-hero-copy">
            <span className="analytics-kicker">Content Performance</span>
            <h2>Your detailed audience insights</h2>
            <p>
              Track views, engagement, and growth across all your articles.
            </p>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-card-icon views">
              <FaEye />
            </div>
            <div className="analytics-card-content">
              <span className="analytics-label">Total Views</span>
              <strong className="analytics-value">
                {analytics?.totalViews || 0}
              </strong>
              <span className="analytics-detail">
                Avg: {analytics?.avgViews || 0} per article
              </span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-icon likes">
              <FaHeart />
            </div>
            <div className="analytics-card-content">
              <span className="analytics-label">Total Likes</span>
              <strong className="analytics-value">
                {analytics?.totalLikes || 0}
              </strong>
              <span className="analytics-detail">
                Avg: {analytics?.avgLikes || 0} per article
              </span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-icon comments">
              <FaComments />
            </div>
            <div className="analytics-card-content">
              <span className="analytics-label">Total Comments</span>
              <strong className="analytics-value">
                {analytics?.totalComments || 0}
              </strong>
              <span className="analytics-detail">
                Avg: {analytics?.avgComments || 0} per article
              </span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-card-icon engagement">
              <FaChartLine />
            </div>
            <div className="analytics-card-content">
              <span className="analytics-label">Engagement Rate</span>
              <strong className="analytics-value">
                {analytics?.engagementRate || 0}%
              </strong>
              <span className="analytics-detail">
                ({analytics?.totalLikes || 0} + {analytics?.totalComments || 0}) /{" "}
                {analytics?.totalViews || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="analytics-posts">
          <div className="analytics-posts-head">
            <span className="analytics-kicker">Recent Posts</span>
            <h2>Top performing articles</h2>
          </div>

          {analytics?.recentPosts?.length > 0 ? (
            <div className="analytics-posts-list">
              {analytics.recentPosts.map((post, index) => (
                <div className="analytics-post-item" key={post._id || index}>
                  <span className="analytics-post-rank">#{index + 1}</span>
                  <div className="analytics-post-info">
                    <h3>{post.title || "Untitled"}</h3>
                    <div className="analytics-post-stats">
                      <span>
                        <FaEye /> {post.views || 0}
                      </span>
                      <span>
                        <FaHeart /> {post.likes?.length || 0}
                      </span>
                      <span>
                        <FaComments /> {post.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-empty">
              <p>No articles published yet. Start writing to see analytics!</p>
            </div>
          )}
        </div>

        <div className="analytics-cta">
          <span className="analytics-cta-kicker">Ready to grow?</span>
          <h2>Share your stories and build your audience</h2>
          <Link to="/create" className="analytics-create-btn">
            Write your next article
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
