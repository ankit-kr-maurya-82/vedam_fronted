import React from "react";
import "./CSS/Features.css";

const featuresData = [
  {
    title: "Like",
    desc: "Appreciate articles and videos with a single click.",
    icon: "❤️",
  },
  {
    title: "Comments",
    desc: "Engage in discussions and share your thoughts.",
    icon: "💬",
  },
  {
    title: "Share",
    desc: "Spread content easily across platforms.",
    icon: "🔗",
  },
];

const Features = () => {
  return (
    <section className="features">
      <h2 className="features_title">Core Features</h2>

      <div className="features_container">
        {featuresData.map((feature, index) => (
          <div className="feature_card" key={index}>
            <div className="feature_icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;