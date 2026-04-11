import { FaArrowRight } from "react-icons/fa";
import "./CSS/FeatureArticle.css";

const articles = [
  {
    id: 1,
    title: "Tech Conference 2024",
    location: "San Francisco · 2:00 pm",
    desc: "Join us for an exciting day of technology talks, networking, and innovation. Meet industry leaders and discover the latest trends.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1170",
  },
  {
    id: 2,
    title: "Developer Meetup",
    location: "New York · 6:00 pm",
    desc: "Connect with fellow developers, share your projects, and learn from community experts. Pizza and drinks provided!",
    image:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1170",
  },
  {
    id: 3,
    title: "AI Workshop",
    location: "Los Angeles · 3:00 pm",
    desc: " Dive deep into artificial intelligence with hands-on sessions and expert guidance. Perfect for developers and researchers looking to expand their AI knowledge.",
    image:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1170",
  },
];

const FeatureArticle = () => {
  return (
    <div className="article_container">
      {articles.map((item, index) => (
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
            <p className="meta">{item.location}</p>
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

export default FeatureArticle;