import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaComments,
  FaCompass,
  FaLayerGroup,
  FaPenNib,
  FaUserCircle,
} from "react-icons/fa";
import UserContext from "../context/UserContext";
import "./CSS/About.css";
import FeatureArticle from "../components/FeatureArticle.jsx";

const quickFacts = [
  {
    title: "Reader-first publishing",
    description: "Long-form posts, media support, and focused reading pages built for attention.",
    icon: <FaPenNib />,
  },
  {
    title: "Community interaction",
    description: "Likes, comments, follows, and profile discovery across the platform experience.",
    icon: <FaComments />,
  },
  {
    title: "Exploration flow",
    description: "Search, explore, and route-based discovery help users move through the product quickly.",
    icon: <FaCompass />,
  },
];

const stackItems = [
  "React with React Router for the frontend experience",
  "Node.js and Express for API and route handling",
  "MongoDB with Mongoose for persistent data storage",
  "JWT-based authentication with protected actions",
  "Responsive layouts for desktop and mobile screens",
  "Theme-aware UI with light and dark presentation",
];

const projectPrinciples = [
  {
    title: "Modular structure",
    copy: "Pages, components, APIs, and shared utilities stay separated so the codebase is easier to grow.",
  },
  {
    title: "Practical social features",
    copy: "The app focuses on the features people actually use together: posts, profiles, reactions, and discovery.",
  },
  {
    title: "Scalable foundation",
    copy: "The project is set up to keep adding features like richer feeds, moderation, or better creator workflows.",
  },
];

const About = () => {
  const { user } = useContext(UserContext);

  return (
    <section className="about-page">
      <div className="about-shell">
        <div className="about-hero">
          <div className="about-hero-copy">
            <span className="about-kicker">About The Project</span>
            <h1>A full-stack social media app built for publishing, discovery, and conversation.</h1>
            <p className="about-lead">
              This project brings together content creation, user profiles,
              engagement tools, and community-focused navigation into one
              modern application flow.
            </p>

            <div className="about-hero-actions">
              <Link to={user ? "/home" : "/login"} className="about-primary-cta">
                {user ? "Go to feed" : "Login to explore"} <FaArrowRight />
              </Link>
              <Link to="/features" className="about-secondary-cta">
                View features
              </Link>
            </div>
          </div>

          <aside className="about-hero-panel">
            <span className="about-panel-label">Built around</span>
            <div className="about-pill-list">
              <span>Posts</span>
              <span>Profiles</span>
              <span>Comments</span>
              <span>Likes</span>
              <span>Explore</span>
              <span>Chat</span>
            </div>
            <div className="about-panel-note">
              <FaLayerGroup />
              <p>
                The goal is to keep the product practical, readable, and easy
                to extend as new features are added.
              </p>
            </div>
          </aside>
        </div>

        <div className="about-facts-grid">
          {quickFacts.map((item) => (
            <article className="about-fact-card" key={item.title}>
              <div className="about-fact-icon">{item.icon}</div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <div className="about-content-grid">
          <article className="about-section-card">
            <div className="about-section-head">
              <span className="about-section-kicker">What it includes</span>
              <h2>The core product surface</h2>
            </div>
            <ul className="about-list">
              <li>User authentication with login, registration, and protected flows</li>
              <li>Home and explore pages for content browsing and discovery</li>
              <li>Profile pages with follow relationships and personal posts</li>
              <li>Dedicated post pages with comments, likes, and sharing</li>
              <li>Create and edit post flows with media support</li>
              <li>Chat and wider social interactions across the app</li>
            </ul>
          </article>

          <article className="about-section-card">
            <div className="about-section-head">
              <span className="about-section-kicker">Architecture</span>
              <h2>The stack behind the experience</h2>
            </div>
            <ul className="about-list">
              {stackItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="about-principles">
          {projectPrinciples.map((item) => (
            <article className="about-principle-card" key={item.title}>
              <div className="about-principle-head">
                <FaUserCircle />
                <h3>{item.title}</h3>
              </div>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>

        <div className="about-editorial-block">
          <div className="about-section-head">
            <span className="about-section-kicker">Editorial Direction</span>
            <h2>Featured article ideas and reading atmosphere</h2>
            <p>
              These pieces reflect the tone of the product: writing-focused,
              thoughtful, and designed around attention rather than noise.
            </p>
          </div>
          <FeatureArticle />
        </div>
      </div>
    </section>
  );
};

export default About;
