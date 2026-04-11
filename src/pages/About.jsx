import React from "react";
import "./CSS/About.css";
import FeatureArticle from "../components/FeatureArticle.jsx";

const About = () => {
  return (
    <section className="about">
      <div className="about__container">
        <h1>About This Project</h1>
        <p className="about__lead">
          This project is a full-stack social media application built to support
          core community features like creating posts, exploring content,
          interacting with user profiles, and chatting in real time.
        </p>

        <div className="about__grid">
          <article className="about__card">
            <h2>What It Includes</h2>
            <ul>
              <li>User authentication with login and registration flows</li>
              <li>Profile pages with user-focused routing</li>
              <li>Home and explore feeds for content discovery</li>
              <li>Post creation and dedicated post pages</li>
              <li>Chat interface for direct communication</li>
              <li>Theme switching with light and dark modes</li>
            </ul>
          </article>

          <article className="about__card">
            <h2>Architecture</h2>
            <p>
              The frontend is built with React and React Router for a clean
              single-page experience. The backend uses Node.js, Express, and
              MongoDB (Mongoose), with JWT-based access and refresh token
              authentication plus bcrypt password hashing.
            </p>
          </article>

          <article className="about__card">
            <h2>Project Goal</h2>
            <p>
              The main goal is to provide a practical, extensible base for a
              modern social platform while keeping the code modular and easy to
              scale with more features.
            </p>
          </article>
          <FeatureArticle />
        </div>
      </div>
    </section>
  );
};

export default About;
