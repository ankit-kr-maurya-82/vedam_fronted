import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Card.css";
import { FaArrowRight, FaEye, FaPen, FaTimes, FaTrash, FaHeart } from "react-icons/fa";
import { getCurrentUser } from "../lib/socialStore";
import { likePost } from "../api/post.api.js";
import { deletePostApi } from "../api/post.js";
import { formatArticleDate } from "../utils/formatArticleDate";

const Card = ({ posts: propPosts, post: singlePost, emptyState }) => {
  const navigate = useNavigate();

  const posts = Array.isArray(propPosts)
    ? propPosts
    : singlePost
      ? [singlePost]
      : [];

  const [activeMedia, setActiveMedia] = useState(null);
  const [likesState, setLikesState] = useState({});
  const currentUser = getCurrentUser();

  const handleLike = async (event, post) => {
    event.preventDefault();
    event.stopPropagation();

    const postId = post.id || post._id;
    const currentLikes = likesState[postId] || {
      count: post.likesCount || 0,
      liked: Boolean(post.liked),
    };
    const optimisticLikes = {
      count: currentLikes.count + (currentLikes.liked ? -1 : 1),
      liked: !currentLikes.liked,
    };

    setLikesState((prev) => ({
      ...prev,
      [postId]: optimisticLikes,
    }));

    try {
      const res = await likePost(postId);
      setLikesState((prev) => ({
        ...prev,
        [postId]: {
          count: res.likesCount ?? optimisticLikes.count,
          liked: res.liked ?? optimisticLikes.liked,
        },
      }));
    } catch (error) {
      setLikesState((prev) => ({
        ...prev,
        [postId]: currentLikes,
      }));
      console.error(error);
    }
  };

  const handleShare = async (event, postId) => {
    event.preventDefault();
    event.stopPropagation();

    const shareUrl = `${window.location.origin}/post/${postId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      window.alert("Post link copied to clipboard!");
    } catch {
      window.prompt("Copy this link:", shareUrl);
    }
  };

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
          const publishedAt = formatArticleDate(post.createdAt || post.updatedAt);
          const isOwner = currentUser?.id === post.authorId;
          const postLikes = likesState[postId] || {
            count: post.likesCount || 0,
            liked: Boolean(post.liked),
          };

          return (
            <article className="feed-card" key={postId}>
              <div className="feed-card-header">
                <h2
                  className="post-title-link"
                  onClick={() => navigate(`/post/${postId}`)}
                >
                  {post.title}
                </h2>

                <div
                  className="feed-excerpt"
                  dangerouslySetInnerHTML={{ __html: (post.content || '').length > 120 ? (post.content.slice(0, 120) + '...') : post.content }}
                />

                <div
                  className="feed-publish-meta"
                  aria-label={publishedAt.full}
                >
                  <span>
                    {publishedAt.day} | {publishedAt.date}
                    {publishedAt.time && ` | ${publishedAt.time}`}
                  </span>
                </div>
              </div>

              {post.media && (
                <div className="feed-media-shell">
                  {post.media.type === "image" ? (
                    <img
                      src={post.media.url}
                      alt=""
                      className="feed-media"
                      onClick={() => setActiveMedia(post.media)}
                      onError={(event) => {
                        event.target.style.display = "none";
                      }}
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

              <div className="feed-card-footer">
                <div className="feed-footer-main">
                  <div className="post-actions">
                    <button
                      type="button"
                      onClick={(event) => handleLike(event, post)}
                      className={`like-btn ${postLikes.liked ? "liked" : ""}`}
                      title="Like"
                    >
                      <FaHeart
                        className={
                          postLikes.liked ? "text-red-500 fill-red-500" : ""
                        }
                      />{" "}
                      {postLikes.count}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => handleShare(event, postId)}
                      className="share-btn"
                      title="Share"
                    >
                      Share
                    </button>
                    <span className="share-btn" title="Views">
                      <FaEye /> {post.views ?? 0}
                    </span>
                  </div>

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
                      <strong className="userfullname">{post.fullName}</strong>
                      <span className="username">@{post.username}</span>
                    </div>
                  </Link>
                </div>

                <div className="feed-footer-actions">
                  <button
                    type="button"
                    className="read_more_btn"
                    onClick={() => navigate(`/post/${postId}`)}
                  >
                    Read article <FaArrowRight />
                  </button>

                  {isOwner && (
                    <div className="owner-actions">
                      <button
                        type="button"
                        className="owner-action-btn"
                        onClick={() => navigate(`/edit/${postId}`)}
                      >
                        <FaPen /> Edit
                      </button>

                      <button
                        type="button"
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

      {activeMedia && (
        <div
          className="media-modal"
          onClick={() => setActiveMedia(null)}
        >
          <div
            className="media-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
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
