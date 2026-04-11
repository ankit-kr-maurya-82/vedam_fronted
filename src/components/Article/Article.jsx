import React from 'react';
import { FaArrowRight, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import demoData from './demoArticle.json';
import "./Article/CSS/Article.css";

// Demo Article Component
const Article = () => {
  // Load articles from JSON file
  const demoArticles = demoData.articles;

  return (
    <div className="article_container">
      <div className="demo-header">
        <h1>Featured Articles</h1>
        <p>Discover the latest insights and trends from our community</p>
      </div>

      {demoArticles.map((article, index) => (
        <div
          className={`main_article ${index % 2 !== 0 ? "reverse" : ""}`}
          key={article.id}
        >
          {/* IMAGE */}
          <div className="left_container">
            <div className="left-article-section">
              <img src={article.image} alt={article.title} />
              <div className="article-category">{article.category}</div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="right-article-section">
            <div className="article-meta-header">
              <span className="username">@{article.username}</span>
              <span className="read-time">{article.readTime}</span>
            </div>

            <h2>{article.title}</h2>

            <div className="article-location">
              <FaMapMarkerAlt /> {article.location} · {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>

            <p className="desc">{article.excerpt}</p>

            <hr />

            <button className="read_more_btn">
              Read Full Article <FaArrowRight />
            </button>
          </div>
        </div>
      ))}

      <div className="demo-footer">
        <p>✨ This is a demo of the Article component with sample data</p>
        <p>📱 Fully responsive design with alternating layouts</p>
        <p>🎨 Customizable themes and styling</p>
      </div>
    </div>
  );
};

export default Article;
