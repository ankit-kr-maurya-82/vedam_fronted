import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
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
  {
    value: "6+",
    label: "Core experiences",
    detail: "Publishing, profiles, reactions, discovery, and more",
  },
  {
    value: "Real-time",
    label: "Social interactions",
    detail: "Fast feedback loops for likes, comments, and sharing",
  },
  {
    value: "Mobile",
    label: "Responsive layout",
    detail: "A single experience that adapts cleanly across screens",
  },
];

const featuresData = [
  {
    title: "Writing and Publishing",
    desc: "Create long-form posts with media support and publish them into the community feed.",
    accent: "Draft to feed",
    icon: <FaPenNib />,
    tone: "amber",
  },
  {
    title: "Likes and Reactions",
    desc: "See real like counts, react instantly, and keep engagement synced with backend data.",
    accent: "Immediate feedback",
    icon: <FaHeart />,
    tone: "rose",
  },
  {
    title: "Comments and Discussion",
    desc: "Open a dedicated post page and continue the conversation through reader comments.",
    accent: "Conversation depth",
    icon: <FaComments />,
    tone: "blue",
  },
  {
    title: "Explore and Search",
    desc: "Find people and posts quickly with search, topic discovery, and explore flows.",
    accent: "Faster discovery",
    icon: <FaCompass />,
    tone: "teal",
  },
  {
    title: "Profiles and Following",
    desc: "Visit user profiles, follow creators, and track communities around shared interests.",
    accent: "Relationship layer",
    icon: <FaUserFriends />,
    tone: "violet",
  },
  {
    title: "Safer Access Control",
    desc: "Use authentication, protected actions, and role-aware behavior across the platform.",
    accent: "Protected actions",
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

const heroPoints = [
  "Designed for creators, readers, and returning communities.",
  "Balances discovery, content creation, and profile-driven interaction.",
  "Keeps the interface approachable while supporting richer product flows.",
];

const Features = () => {
  const { user } = useContext(UserContext);

  return (
    <section className="features-page">
      <div className="features-shell">
        <div className="features-hero">
          <div className="features-copy">
            <span className="features-kicker">Platform Features</span>
            <h1>A social product flow built to publish, discover, react, and come back.</h1>
            <p className="features-lead">
              The feature experience brings together publishing tools,
              profile-driven relationships, community engagement, and
              discovery patterns in a single full-stack social app.
            </p>

            <div className="features-actions">
              <Link
                to={user ? "/create" : "/login"}
                className="features-primary-cta"
              >
                {user ? "Create a post" : "Login to start"} <FaArrowRight />
              </Link>
              <Link to="/explore" className="features-secondary-cta">
                Explore content
              </Link>
            </div>

            <div className="features-highlights">
              {heroPoints.map((point) => (
                <div className="features-highlight-item" key={point}>
                  <span className="features-highlight-icon">
                    <FaCheckCircle />
                  </span>
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="features-hero-panel">
            <span className="features-panel-label">Experience snapshot</span>
            <div className="features-stage">
              <div className="features-stage-orbit features-stage-orbit--amber" />
              <div className="features-stage-orbit features-stage-orbit--blue" />

              <article className="features-stage-card">
                <div className="features-stage-topline">
                  <span className="features-stage-badge">Platform pulse</span>
                  <span className="features-stage-status">Live flow</span>
                </div>

                <div className="features-stage-copy">
                  <strong>From first discovery to community interaction</strong>
                  <p>
                    The product is structured so readers can move from feed
                    browsing into profiles, posts, comments, and creator
                    actions without feeling lost.
                  </p>
                </div>

                <div className="features-stage-stack">
                  {featuresData.slice(0, 4).map((feature) => (
                    <div
                      className={`features-stage-item features-stage-item--${feature.tone}`}
                      key={feature.title}
                    >
                      <span className="features-stage-item-icon">{feature.icon}</span>
                      <div>
                        <strong>{feature.title}</strong>
                        <span>{feature.accent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>

        <div className="features-stats">
          {highlightStats.map((stat) => (
            <article className="features-stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <p>{stat.detail}</p>
            </article>
          ))}
        </div>

        <section className="features-showcase">
          <div className="features-section-head">
            <span className="features-section-kicker">Core capabilities</span>
            <h2>The product is organized around the moments users repeat most.</h2>
          </div>

          <div className="features-grid">
            {featuresData.map((feature, index) => (
              <article
                className={`feature-card feature-card--${feature.tone}`}
                key={feature.title}
              >
                <div className="feature-card-topline">
                  <span className="feature-card-index">0{index + 1}</span>
                  <span className="feature-card-accent">{feature.accent}</span>
                </div>
                <div className="feature-icon">{feature.icon}</div>
                <h2>{feature.title}</h2>
                <p>{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

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

        <article className="features-cta-band">
          <div>
            <span className="features-section-kicker">Next step</span>
            <h2>See the feature set in action inside the app.</h2>
            <p>
              Jump into discovery, start publishing, or sign in to explore the
              full end-to-end experience.
            </p>
          </div>

          <div className="features-cta-actions">
            <Link to="/explore" className="features-secondary-cta">
              Browse explore
            </Link>
            <Link
              to={user ? "/create" : "/register"}
              className="features-primary-cta"
            >
              {user ? "Write your next post" : "Create an account"}
              <FaArrowRight />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
};

export default Features;
