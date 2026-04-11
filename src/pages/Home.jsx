import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import { getFeedPosts } from "../lib/socialStore.js";
import UserContext from "../context/UserContext.js";
import { fetchPosts } from "../api/post.api.js";
import SkeletonCard from "../components/SkeletonCard.jsx";
import "./CSS/Home.css";

const Home = () => {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const emptyFeedState = {
    kicker: "No articles yet",
    title: "Your feed is empty for now.",
    description: "Publish your first article to start building your reading feed.",
  };
  const topics =
    [...new Set(posts.flatMap((post) => post.tags || []))].slice(0, 6).length > 0
      ? [...new Set(posts.flatMap((post) => post.tags || []))].slice(0, 6)
      : ["design", "writing", "product", "culture", "startup", "community"];
  const recentArticles = posts.slice(0, 3);
  const people = posts
    .reduce((list, post) => {
      const exists = list.some((person) => person.username === post.username);
      if (exists || !post.username) {
        return list;
      }

      return [
        ...list,
        {
          username: post.username,
          fullName: post.fullName,
          avatar: post.avatar,
        },
      ];
    }, [])
    .filter((person) => person.username !== user?.username)
    .slice(0, 4);

  useEffect(() => {
    let cancelled = false;

    const loadPosts = async () => {
      setLoading(true);

      try {
        const remotePosts = await fetchPosts();
        if (!cancelled) {
          setPosts(Array.isArray(remotePosts) ? remotePosts : []);
        }
      } catch {
        if (!cancelled) {
          setPosts(getFeedPosts());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home-page">
      <section className="create-post-banner">
        <div>
          <p className="create-post-kicker">Community Feed</p>
          <h1>Share your next post with the community</h1>
          <p className="create-post-copy">
            Write a quick update, publish an article, or drop an image that
            deserves attention.
          </p>
        </div>
        <Link to={user ? "/create" : "/login"} className="create-post-cta">
          {user ? "Add Post" : "Login To Post"}
        </Link>
      </section>

      <section className="home-content-grid">
        <div className="home-feed-column">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <Card posts={posts} emptyState={emptyFeedState} />
          )}
        </div>

        <aside className="home-rail">
          <article className="home-rail-card">
            <div className="home-rail-head">
              <span className="home-rail-kicker">Topics</span>
              <h2>What readers are exploring</h2>
            </div>
            <div className="topic-pill-list">
              {topics.map((topic) => (
                <Link key={topic} to={`/explore?q=${encodeURIComponent(topic)}`} className="topic-pill">
                  #{topic}
                </Link>
              ))}
            </div>
          </article>

          <article className="home-rail-card">
            <div className="home-rail-head">
              <span className="home-rail-kicker">Recent</span>
              <h2>Fresh from the feed</h2>
            </div>
            <div className="home-rail-list">
              {recentArticles.length > 0 ? (
                recentArticles.map((post) => (
                  <Link key={post.id || post._id} to={`/post/${post.id || post._id}`} className="home-rail-link">
                    <strong>{post.title}</strong>
                    <span>by {post.fullName}</span>
                  </Link>
                ))
              ) : (
                <p className="home-rail-empty">New articles will appear here as soon as they are published.</p>
              )}
            </div>
          </article>

          <article className="home-rail-card">
            <div className="home-rail-head">
              <span className="home-rail-kicker">People</span>
              <h2>Writers to visit</h2>
            </div>
            <div className="home-rail-list">
              {people.length > 0 ? (
                people.map((person) => (
                  <Link key={person.username} to={`/profile/${person.username}`} className="home-person-link">
                    {person.avatar ? (
                      <img src={person.avatar} alt={person.username} className="home-person-avatar" />
                    ) : (
                      <div className="home-person-avatar fallback">
                        {person.fullName?.charAt(0) || person.username?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <strong>{person.fullName || person.username}</strong>
                      <span>@{person.username}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="home-rail-empty">As more writers publish, their profiles will show up here.</p>
              )}
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
};

export default Home;
