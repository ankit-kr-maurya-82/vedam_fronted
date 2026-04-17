import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Card.css";
import dummyPosts from "./dummyPosts.js";
import { FaArrowRight, FaPen, FaTimes, FaTrash, FaHeart } from "react-icons/fa";
import { getCurrentUser } from "../lib/socialStore";
import { likePost } from "../api/post.api.js";
import { deletePostApi } from "../api/post.js";
import { formatArticleDate } from "../utils/formatArticleDate";
import { useCallback } from "react";

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

                {/*  HTML content render */}
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
                {/* POST ACTIONS */}
                <div className="post-actions">
                  {(() => {
                    const postId = post.id || post._id;
                    const postLikes = likesState[postId] || { count: post.likesCount || 0, liked: false };
                    const handleLike = useCallback(async () => {
                      const currentLikes = likesState[postId] || { count: post.likesCount || 0, liked: false };
                      setLikesState(prev => ({ ...prev, [postId]: { ...currentLikes, liked: !currentLikes.liked, count: currentLikes.count + (currentLikes.liked ? -1 : 1) } })); // optimistic toggle
                      setLikesState(prev => ({ ...prev, [postId]: { ...currentLikes, liked: optimisticLiked, count: optimisticCount } }));
                      try {
                        const res = await likePost(postId);
                        setLikesState(prev => ({ ...prev, [postId]: { count: res.data.data.likesCount, liked: res.data.data.liked } }));
                      } catch (err) {
                        setLikesState(prev => ({ ...prev, [postId]: currentLikes }));
                        console.error(err);
                      }
                    }, [postId, likesState, post.likesCount]);

                    const handleShare = useCallback(() => {
                      const shareUrl = `${window.location.origin}/post/${postId}`;
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        alert('Post link copied to clipboard!');
                      }).catch(() => {
                        prompt('Copy this link:', shareUrl);
                      });
                    }, [postId]);

                    return (
                      <>
                        <button 
                          onClick={handleLike} 
                          className={`like-btn ${postLikes.liked ? 'liked' : ''}`}
                          title="Like"
                        >
                          <FaHeart className={postLikes.liked ? 'text-red-500 fill-red-500' : ''} /> {postLikes.count}
                        </button>
                        <button 
                          onClick={handleShare} 
                          className="share-btn"
                          title="Share"
                        >
                          🔗
                        </button>
                      </>
                    );
                  })()}
                </div>
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