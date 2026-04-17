import React from "react";
import { Link } from "react-router-dom";
import { FaCompass, FaGithub, FaLinkedin, FaNewspaper, FaPenNib } from "react-icons/fa";
import "./Footer.css";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/explore" },
  { label: "Features", to: "/features" },
  { label: "About", to: "/about" },
];

const footerHighlights = [
  {
    icon: <FaNewspaper />,
    title: "Editorial reading",
    text: "A calmer place for articles, essays, and thoughtful posts.",
  },
  {
    icon: <FaPenNib />,
    title: "Writer tools",
    text: "Publish posts, shape your profile, and grow your public voice.",
  },
  {
    icon: <FaCompass />,
    title: "Discovery flow",
    text: "Search, explore, and move through people, posts, and ideas.",
  },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/your-username", icon: <FaGithub /> },
  { label: "LinkedIn", href: "https://linkedin.com/in/your-profile", icon: <FaLinkedin /> },
];

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__shell">
        <div className="site-footer__hero">
          <div className="site-footer__brand">
            <span className="site-footer__kicker">VEDA JOURNAL</span>
            <h2>A social publishing space for writing, discovery, and meaningful interaction.</h2>
            <p>
              Built to give articles, creators, and reader conversations a more
              deliberate home than a fast-moving timeline.
            </p>
          </div>

          <div className="site-footer__highlights">
            {footerHighlights.map((item) => (
              <article className="site-footer__highlight" key={item.title}>
                <div className="site-footer__highlight-icon">{item.icon}</div>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__column">
            <h3>Navigate</h3>
            <div className="site-footer__links">
              {footerLinks.map((item) => (
                <Link key={item.label} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="site-footer__column">
            <h3>Project</h3>
            <p>
              VEDA combines article publishing, profile identity, community
              response, and route-based discovery into one connected platform.
            </p>
          </div>

          <div className="site-footer__column">
            <h3>Connect</h3>
            <div className="site-footer__socials">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} VEDA. Built by Ankit Maurya.</span>
          <span>Designed for readers, writers, and communities with a longer attention span.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
