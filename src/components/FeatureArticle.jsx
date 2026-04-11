import { FaArrowRight } from "react-icons/fa";
import "./CSS/FeatureArticle.css";
import articleCoverOne from "../assets/article-cover-one.svg";
import articleCoverTwo from "../assets/article-cover-two.svg";
import feedCoverTwo from "../assets/feed-cover-two.svg";

const articles = [
  {
    id: 1,
    title: "The Return of Personal Publishing in an Algorithmic Era",
    location: "Essay | Culture & Media",
    desc: "Personal websites, newsletters, and digital journals are becoming more valuable because they slow the internet down just enough for a real voice to come through.",
    image: articleCoverOne,
  },
  {
    id: 2,
    title: "Designing Calm Interfaces for Readers Who Stay",
    location: "Feature | Design Systems",
    desc: "Good reading experiences are not empty. They are paced. The best article layouts guide attention with rhythm, contrast, and just enough room to breathe.",
    image: articleCoverTwo,
  },
  {
    id: 3,
    title: "What Creative Work Looks Like After the Productivity Hype",
    location: "Column | Work & Process",
    desc: "The next generation of creative tools may be less about output volume and more about helping people think, draft, revise, and publish with intention.",
    image: feedCoverTwo,
  },
];

const FeatureArticle = () => {
  return (
    <div className="article_container">
      {articles.map((item, index) => (
        <article
          className={`main_article ${index % 2 !== 0 ? "reverse" : ""}`}
          key={item.id}
        >
          <div className="left_container">
            <div className="left-article-section">
              <img src={item.image} alt={item.title} />
            </div>
          </div>

          <div className="right-article-section">
            <p className="meta">{item.location}</p>
            <h2>{item.title}</h2>
            <p className="desc">{item.desc}</p>

            <hr />

            <button className="read_more_btn">
              Read Story <FaArrowRight />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default FeatureArticle;
