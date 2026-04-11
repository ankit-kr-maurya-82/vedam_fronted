import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import "./CSS/VedHome.css";
import "./CSS/Hero.css";
import "./CSS/Article.css";
import UserContext from "../context/UserContext";

const editorNotes = [
  {
    label: "Issue 28",
    value: "Editorial essays",
    text: "Long-form stories on design, internet culture, and meaningful digital work.",
  },
  {
    label: "This week",
    value: "3 featured reads",
    text: "Carefully selected articles with a slower pace and stronger point of view.",
  },
  {
    label: "Morning brief",
    value: "9:00 AM",
    text: "A concise reading list for people who prefer signal over noise.",
  },
];

const VedHome = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="ved_home_container">
      <section className="hero hero-shell">
        <div className="editorial-topline">
          <span className="publication-mark">VEDA JOURNAL</span>
          <span className="publication-date">Issue 28 | Essays, commentary, and modern web culture</span>
        </div>

        <div className="hero-layout">
          <div className="hero-copy">
            <span className="hero-badge">Cover Feature</span>
            <h1 className="hero-title">
              An article-first home for readers who still enjoy depth.
            </h1>

            <p className="hero-subtitle">
              Discover thoughtful writing on product design, creative practice,
              digital aesthetics, and the quieter ideas that age well after the
              scroll ends.
            </p>

            <div className="hero-actions">
              <Link to="/explore" className="btn primary">
                Read The Latest
              </Link>
              <Link to={user ? "/create" : "/register"} className="btn secondary">
                Publish An Article <FaArrowRight />
              </Link>
            </div>
          </div>

          <aside className="hero-sidebar">
            <article className="lead-story-card">
              <div className="story-frame">
                <span className="story-kicker">From the editor</span>
                <h2>The internet still makes room for writing with patience.</h2>
                <p>
                  The best reading experiences do not compete with noise. They
                  create atmosphere, trust the reader, and leave enough silence
                  around an idea for it to land properly.
                </p>
              </div>

              <div className="story-meta">
                <span>8 min read</span>
                <span>Editorial</span>
                <span>April issue</span>
              </div>
            </article>
          </aside>
        </div>

        <div className="hero-stats">
          {editorNotes.map((item) => (
            <article className="hero-stat-card" key={item.label}>
              <p className="stat-label">{item.label}</p>
              <strong>{item.value}</strong>
              <span>{item.text}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default VedHome;
