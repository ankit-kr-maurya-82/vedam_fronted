import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./CSS/Explore.css";
import Card from "../components/Card";
import { searchContent } from "../api/search";

const Explore = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [] });
  const debouncedQuery = query.trim();

  useEffect(() => {
    let cancelled = false;

    const loadResults = async () => {
      const nextResults = await searchContent(debouncedQuery);
      if (!cancelled) {
        setResults(nextResults);
      }
    };

    loadResults();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    const initialQuery = searchParams.get("q") || "";
    setQuery(initialQuery);
  }, [searchParams]);

  const users = results.users || [];
  const posts = results.posts || [];

  return (
    <div className="explore-page">
      <div className="explore-search">
        <input
          type="text"
          placeholder="Search posts, users, or date like 20/04/2026"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="explore-results-grid">
        <section className="explore-users">
          <div className="explore-section-head">
            <h2>Users</h2>
            <span>{users.length}</span>
          </div>

          {users.length === 0 ? (
            <p className="empty-state">No users found</p>
          ) : (
            users.map((user) => (
              <Link
                key={user.id || user._id}
                to={`/profile/${user.username}`}
                className="user-result-card"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="user-result-avatar" />
                ) : (
                  <div className="user-result-avatar fallback">
                    {user.username?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div>
                  <strong>{user.fullName || user.username}</strong>
                  <span>@{user.username}</span>
                  <p>{user.bio || "No bio available."}</p>
                </div>
              </Link>
            ))
          )}
        </section>

        <section className="explore-feed">
          <div className="explore-section-head">
            <h2>Articles</h2>
            <span>{posts.length}</span>
          </div>

          {posts.length === 0 ? (
            <p className="empty-state">No articles found</p>
          ) : (
            <Card posts={posts} />
          )}
        </section>
      </div>
    </div>
  );
};

export default Explore;
