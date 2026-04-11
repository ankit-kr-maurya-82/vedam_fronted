import React from 'react';
import { FaArrowRight } from "react-icons/fa";
import "./Article/CSS/Article.css";

const Article = ({ articles = [] }) => {
  // Default articles data if none provided
  const defaultArticles = [
    {
      id: 1,
      username: "john_doe",
      title: "Tech Conference 2024",
      location: "San Francisco · 2:00 pm",
      desc: "Join us for an exciting day of technology talks, networking, and innovation. Meet industry leaders and discover the latest trends.",
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1170",
    },
    {
      id: 2,
        username: "jane_smith",
      title: "Developer Meetup",
      location: "New York · 6:00 pm",
      desc: "Connect with fellow developers, share your projects, and learn from community experts. Pizza and drinks provided!",
      image:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1170",
    },
  ];

  const displayArticles = articles.length > 0 ? articles : defaultArticles;

  return (
    <div className="article_container">
      {displayArticles.map((item, index) => (
        <div
          className={`main_article ${index % 2 !== 0 ? "reverse" : ""}`}
          key={item.id}
        >
          {/* IMAGE */}
          <div className="left_container">
            <div className="left-article-section">
              <img src={item.image} alt={item.title} />
            </div>
          </div>

          {/* CONTENT */}
          <div className="right-article-section">
            <h2>{item.title}</h2>
            <p className="meta">
              <span className="username">@{item.username}</span> · {item.location}
            </p>
            <p className="desc">{item.desc}</p>

            <hr />

            <button className="read_more_btn">
              View Event Details <FaArrowRight />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Article;
