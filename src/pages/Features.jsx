import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBolt,
  FaComments,
  FaCompass,
  FaHeart,
  FaMoon,
  FaPenNib,
  FaShareAlt,
  FaShieldAlt,
  FaUserFriends,
} from "react-icons/fa";
import UserContext from "../context/UserContext";
import "./CSS/Features.css";

const highlightStats = [
  { value: "6+", label: "Core experiences" },
  { value: "Real-time", label: "Social interactions" },
  { value: "Mobile", label: "Responsive layout" },
];

const featuresData = [
  {
    title: "Writing and Publishing",
    desc: "Create long-form posts with media support and publish them into the community feed.",
    icon: <FaPenNib />,
    tone: "amber",
  },
  {
    title: "Likes and Reactions",
    desc: "See real like counts, react instantly, and keep engagement synced with backend data.",
    icon: <FaHeart />,
    tone: "rose",
  },
  {
    title: "Comments and Discussion",
    desc: "Open a dedicated post page and continue the conversation through reader comments.",
    icon: <FaComments />,
    tone: "blue",
  },
  {
    title: "Explore and Search",
    desc: "Find people and posts quickly with search, topic discovery, and explore flows.",
    icon: <FaCompass />,
    tone: "teal",
  },
  {
    title: "Profiles and Following",
    desc: "Visit user profiles, follow creators, and track communities around shared interests.",
    icon: <FaUserFriends />,
    tone: "violet",
  },
  {
    title: "Safer Access Control",
    desc: "Use authentication, protected actions, and role-aware behavior across the platform.",
    icon: <FaShieldAlt />,
    tone: "slate",
  },
];

const workflowSteps = [
  {
    title: "Discover",
    desc: "Readers browse the feed, search for topics, and jump into profiles or posts.",
  },
  {
    title: "Engage",
    desc: "Users like, comment, and share content directly from cards and post pages.",
  },
  {
    title: "Return",
    desc: "Follow relationships and fresh posts keep people coming back to the platform.",
  },
];

const featureExtras = [
  {
    title: "Share-ready posts",
    desc: "Each article can be copied and shared with a direct post link.",
    icon: <FaShareAlt />,
  },
  {
    title: "Smooth experience",
    desc: "Thoughtful interactions, optimistic UI updates, and focused reading layouts.",
    icon: <FaBolt />,
  },
  {
    title: "Theme support",
    desc: "Built-in light and dark theme behavior across the wider application shell.",
    icon: <FaMoon />,
  },
];

const Features = () => {
  const { user } = useContext(UserContext);

  return (
    <section className="features-page">
      <div className="features-shell">
        <div className="features-hero">
          <div className="features-copy">
            <span className="features-kicker">Platform Features</span>
            <h1>Everything needed to publish, discover, and interact in one social app.</h1>
            <p className="features-lead">
              This experience combines writing tools, community engagement,
              profile discovery, and responsive navigation into a single
              full-stack product flow.
            </p>

            <div className="features-actions">
              <Link to={user ? "/create" : "/login"} className="features-primary-cta">
                {user ? "Create a post" : "Login to start"} <FaArrowRight />
              </Link>
              <Link to="/explore" className="features-secondary-cta">
                Explore content
              </Link>
            </div>
          </div>

          <div className="features-hero-panel">
            <span className="features-panel-label">What stands out</span>
            <div className="features-stats">
              {highlightStats.map((stat) => (
                <article className="features-stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="features-grid">
          {featuresData.map((feature) => (
            <article
              className={`feature-card feature-card--${feature.tone}`}
              key={feature.title}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h2>{feature.title}</h2>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>

        <div className="features-detail-grid">
          <article className="features-section-card">
            <div className="features-section-head">
              <span className="features-section-kicker">User flow</span>
              <h2>How people move through the app</h2>
            </div>
            <div className="workflow-list">
              {workflowSteps.map((step, index) => (
                <div className="workflow-item" key={step.title}>
                  <span className="workflow-number">0{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="features-section-card">
            <div className="features-section-head">
              <span className="features-section-kicker">Extra touches</span>
              <h2>Useful details across the product</h2>
            </div>
            <div className="extras-list">
              {featureExtras.map((item) => (
                <div className="extra-item" key={item.title}>
                  <div className="extra-icon">{item.icon}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Features;
