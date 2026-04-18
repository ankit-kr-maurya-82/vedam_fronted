import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBolt,
  FaComments,
  FaCompass,
  FaNewspaper,
  FaPenNib,
  FaUserCircle,
} from "react-icons/fa";
import "./CSS/VedHome.css";
import "./CSS/VedHome2.css";
import UserContext from "../context/UserContext";

const pulseStats = [
  { value: "Article-led", label: "Homepage direction" },
  { value: "Profiles", label: "Visible creator identity" },
  { value: "Live", label: "Social interactions" },
];

const channels = [
  {
    title: "Reading Lane",
    text: "Feature articles, slower essays, and posts that reward attention instead of interruption.",
    icon: <FaNewspaper />,
  },
  {
    title: "Creator Lane",
    text: "Writers get profile pages, post creation flows, and a more public author presence.",
    icon: <FaPenNib />,
  },
  {
    title: "Community Lane",
    text: "Likes, comments, and discoverability keep each piece connected to actual people.",
    icon: <FaComments />,
  },
];

const flowSteps = [
  {
    step: "01",
    title: "Land on the issue board",
    text: "The page leads with a curated point of view instead of a generic product banner.",
  },
  {
    step: "02",
    title: "Move into content",
    text: "Readers jump into the feed, explore sections, or open post pages with clear entry points.",
  },
  {
    step: "03",
    title: "Become part of it",
    text: "Profiles, follows, reactions, and publishing give the homepage a real next step.",
  },
];

const pathwayCards = [
  {
    title: "Explore the feed",
    text: "See the main content flow and browse what people are publishing.",
    to: "/home",
    icon: <FaCompass />,
    authOnly: true,
  },
  {
    title: "Discover features",
    text: "Understand the full product surface and interaction set.",
    to: "/features",
    icon: <FaBolt />,
  },
  {
    title: "Start your profile",
    text: "Create an identity and begin publishing your own writing.",
    to: "/register",
    icon: <FaUserCircle />,
    guestOnly: true,
  },
  {
    title: "Write a new article",
    text: "Jump directly into the editor and publish something with weight.",
    to: "/create",
    icon: <FaPenNib />,
    authOnly: true,
  },
];

const editorialPanels = [
  {
    label: "Layout shift",
    title: "Same mood, different reading order.",
    text: "The page now opens like a wider editorial spread, so product context and story arrive together.",
  },
  {
    label: "Why it works",
    title: "Content, identity, and action stay visible in one glance.",
    text: "Readers understand the platform faster because the sections feel connected instead of stacked without rhythm.",
  },
];

const VedHome = () => {
  const { user } = useContext(UserContext);

  const visiblePathways = pathwayCards.filter((card) => {
    if (card.authOnly) {
      return Boolean(user);
    }

    if (card.guestOnly) {
      return !user;
    }

    return true;
  });

  return (
    <div className="ved3-page">
      <section className="ved3-shell ved3-hero">
        <div className="ved3-ribbon">
          <span className="ved3-ribbon-mark">VEDAM</span>
          <p>
            New homepage direction with a sharper editorial-product hybrid
            layout
          </p>
        </div>

        <div className="ved3-hero-grid">
          <div className="ved3-headline-block">
            <div>
              <h1>A better place to read and write.</h1>
              <p>
                Discover ideas, follow creators, and publish your own stories on
                a platform designed for clarity and focus.
              </p>
            </div>

            <div className="ved3-headline-footer">
              <div className="ved3-actions">
                <Link
                  to={user ? "/home" : "/explore"}
                  className="ved3-btn ved3-btn-primary"
                >
                  {user ? "Open the feed" : "Explore first"}
                </Link>
                <Link
                  to={user ? "/create" : "/register"}
                  className="ved3-btn ved3-btn-secondary"
                >
                  {user ? "Publish now" : "Join VEDAM"} <FaArrowRight />
                </Link>
              </div>

              <div className="ved3-inline-stats">
                {pulseStats.map((item) => (
                  <article className="ved3-mini-card" key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="ved3-hero-stage">
            <article className="ved3-billboard-main ved3-billboard-cover">
              <span className="ved3-note-label">Cover note</span>
              <h2>The best social spaces do not hide writing behind noise.</h2>
              <p>
                VEDA gives articles, profiles, and community responses a more
                deliberate stage so the experience feels memorable before it
                feels busy.
              </p>
            </article>

            <div className="ved3-stage-side">
              {editorialPanels.map((item) => (
                <article className="ved3-stage-panel" key={item.label}>
                  <span className="ved3-note-label">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ved3-shell ved3-story-layout">
        <div className="ved3-story-main">
          <div className="ved3-section-head">
            <span className="ved3-kicker">Content System</span>
            <h2>Three lanes that define how the product feels.</h2>
            <p>
              The visual tone stays the same, but the middle of the page now
              reads like a composed spread instead of a simple block stack.
            </p>
          </div>

          <div className="ved3-channel-grid">
            {channels.map((item) => (
              <article className="ved3-channel-card" key={item.title}>
                <div className="ved3-channel-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="ved3-story-journey">
          <div className="ved3-board-copy">
            <span className="ved3-kicker">Reader Journey</span>
            <h2>
              A homepage structure that gives people a clear path from curiosity
              to contribution.
            </h2>
            <p>
              The page is meant to work like a launch board. It sets tone
              quickly, shows the product lanes, and makes the next actions feel
              obvious instead of buried.
            </p>
          </div>

          <div className="ved3-flow-list">
            {flowSteps.map((item) => (
              <article className="ved3-flow-card" key={item.step}>
                <span className="ved3-flow-step">{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ved3-shell ved3-path-layout">
        <div className="ved3-path-feature">
          <span className="ved3-kicker">Entry Points</span>
          <h2>
            Use the landing page to route people into the product with purpose.
          </h2>
          <p>
            {user
              ? "Returning readers can move straight into the feed or jump into publishing without losing the editorial tone."
              : "Guests can explore the platform, understand the product, and then step into their own profile with a clearer sense of what VEDAM is."}
          </p>
        </div>

        <div className="ved3-path-grid">
          {visiblePathways.map((item) => (
            <Link to={item.to} className="ved3-path-card" key={item.title}>
              <div className="ved3-path-icon">{item.icon}</div>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
              <FaArrowRight className="ved3-path-arrow" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default VedHome;
