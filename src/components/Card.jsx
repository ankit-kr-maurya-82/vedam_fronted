import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Card.css";
import dummyPosts from "./dummyPosts.js";
import { FaArrowRight, FaPen, FaTimes, FaTrash } from "react-icons/fa";
import { getCurrentUser } from "../lib/socialStore";
import { deletePostApi } from "../api/post";
import { formatArticleDate } from "../utils/formatArticleDate";

const Card = ({ posts: propPosts, post: singlePost, emptyState }) => {
  const navigate = useNavigate();

  const posts = Array.isArray(propPosts)
    ? propPosts
    : singlePost
    ? [singlePost]
    : [];

  const [activeMedia, setActiveMedia] = useState(null);
  const currentUser = getCurrentUser();

  return (
    <>
      <div className="feed">
        {posts.length === 0 && emptyState && (
          <article className="feed-card empty-feed-card">
            <h2 className="post-title-link static-title">{emptyState.title}</h2>
            <p className="feed-excerpt">{emptyState.description}</p>
          </article>
        )}

        {posts.map((post) => {
          const postId = post.id || post._id;
          const publishedAt = formatArticleDate(
            post.createdAt || post.updatedAt
          );
          const isOwner = currentUser?.id === post.authorId;

          return (
            <article className="feed-card" key={postId}>
              {/* HEADER */}
              <div className="feed-card-header">
                <h2
                  className="post-title-link"
                  onClick={() => navigate(`/post/${postId}`)}
                >
                  {post.title}
                </h2>

                {/* ✅ HTML content render */}
                <div
                  className="feed-excerpt"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* DATE */}
                <div
                  className="feed-publish-meta"
                  aria-label={publishedAt.full}
                >
                  <span>
                    {publishedAt.day} • {publishedAt.date}
                    {publishedAt.time && ` • ${publishedAt.time}`}
                  </span>
                </div>
              </div>

              {/* MEDIA */}
              {post.media && (
                <div className="feed-media-shell">
                  {post.media.type === "image" ? (
                    <img
                      src={post.media.url}
                      alt=""
                      className="feed-media"
                      onClick={() => setActiveMedia(post.media)}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <video
                      src={post.media.url}
                      className="feed-media"
                      controls
                      onClick={() => setActiveMedia(post.media)}
                    />
                  )}
                </div>
              )}

              {/* FOOTER */}
              <div className="feed-card-footer">
                <div className="feed-footer-main">
                  <Link
                    to={`/profile/${post.username}`}
                    className="post-author"
                  >
                    {post.avatar ? (
                      <img
                        src={post.avatar}
                        alt="avatar"
                        className="post-avatar-small"
                      />
                    ) : (
                      <div className="avatar-fallback-small">
                        {post.fullName?.charAt(0)}
                      </div>
                    )}

                    <div>
                      <strong className="userfullname">
                        {post.fullName}
                      </strong>
                      <span className="username">
                        @{post.username}
                      </span>
                    </div>
                  </Link>
                </div>

                <div className="feed-footer-actions">
                  <button
                    className="read_more_btn"
                    onClick={() => navigate(`/post/${postId}`)}
                  >
                    Read article <FaArrowRight />
                  </button>

                  {isOwner && (
                    <div className="owner-actions">
                      <button
                        className="owner-action-btn"
                        onClick={() => navigate(`/edit/${postId}`)}
                      >
                        <FaPen /> Edit
                      </button>

                      <button
                        className="owner-action-btn danger"
                        onClick={async () => {
                          try {
                            await deletePostApi(postId);
                            window.location.reload();
                          } catch {
                            window.alert(
                              "Database delete failed. Check backend/MongoDB."
                            );
                          }
                        }}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* MODAL */}
      {activeMedia && (
        <div
          className="media-modal"
          onClick={() => setActiveMedia(null)}
        >
          <div className="media-content">
            <button
              className="close-btn"
              onClick={() => setActiveMedia(null)}
            >
              <FaTimes />
            </button>

            {activeMedia.type === "image" ? (
              <img src={activeMedia.url} alt="media" />
            ) : (
              <video src={activeMedia.url} controls />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Card;