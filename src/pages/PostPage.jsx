import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import "./CSS/PostPage.css";
import "./CSS/PostPage-part2.css";
import "./CSS/ArticleContent.css";
import { FaArrowLeft, FaClock, FaCommentDots, FaPen, FaPlus, FaTrash } from "react-icons/fa";
import Comments from "../components/Comments/Comments.jsx";
import UserContext from "../context/UserContext";
import FollowBtn from "../components/FollowBtn";
import { deletePostApi, fetchPostById } from "../api/post.js";
import { fetchProfileBundle, toggleFollowProfile } from "../api/profile";
import { formatArticleDate } from "../utils/formatArticleDate.js";

// Helper to convert &lt;p&gt; back to <p>
const unescapeHTML = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.documentElement.textContent;
};

const PostPage = () => {
  const { postId } = useParams();
  const { user, setUser } = useContext(UserContext);
  const [activePost, setActivePost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(true);
  const commentsPanelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadPost = async () => {
      setLoading(true);
      try {
        const post = await fetchPostById(postId);
        if (!cancelled) {
          setActivePost(post);
          setCommentCount(post?.commentsCount || 0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setActivePost(null);
          setLoading(false);
        }
      }
    };

    loadPost();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  useEffect(() => {
    let cancelled = false;

    const loadAuthorProfile = async () => {
      if (!activePost?.username) {
        setAuthorProfile(null);
        return;
      }

      const bundle = await fetchProfileBundle(activePost.username);
      if (!cancelled) {
        setAuthorProfile(bundle.user || null);
      }
    };

    loadAuthorProfile();
    return () => {
      cancelled = true;
    };
  }, [activePost?.username]);

  // Process content: check if it's escaped and unescape if necessary
  const processedContent = useMemo(() => {
    if (!activePost?.content) return "";
    // Detect if the string contains encoded HTML entities
    if (activePost.content.includes("&lt;") || activePost.content.includes("&gt;")) {
      return unescapeHTML(activePost.content);
    }
    return activePost.content;
  }, [activePost?.content]);

  if (loading) {
    return <div className="article-page">Loading article...</div>;
  }

  if (!activePost) {
    return <div className="article-page">Post not found.</div>;
  }

  const estimatedReadTime =
    activePost.readTime ||
    `${Math.max(3, Math.ceil((activePost.content?.length || 0) / 180))} min read`;
  const publishedAt = formatArticleDate(activePost.createdAt || activePost.updatedAt);
  const isOwner = user?.id === activePost.authorId;
  const canFollowAuthor = Boolean(user && !isOwner && authorProfile?.username);

  const handleFollowToggle = async () => {
    if (!authorProfile?.username || !user || followLoading) {
      return;
    }

    setFollowLoading(true);

    const wasFollowing = Boolean(authorProfile.isFollowing);
    setAuthorProfile((current) =>
      current
        ? {
            ...current,
            isFollowing: !wasFollowing,
          }
        : current
    );

    try {
      const result = await toggleFollowProfile(authorProfile.username);
      setAuthorProfile(result.profile || null);
      if (result.currentUser) {
        setUser(result.currentUser);
      }
    } catch (error) {
      setAuthorProfile((current) =>
        current
          ? {
              ...current,
              isFollowing: wasFollowing,
            }
          : current
      );
      window.alert(
        error.response?.data?.message || error.message || "Unable to update follow status"
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleOpenComments = () => {
    setCommentsOpen(true);
    commentsPanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="article-page">
      <div className="article-page-topbar">
        <Link to="/home" className="article-nav-link">
          <FaArrowLeft /> Back to feed
        </Link>
        <Link to="/create" className="create-post-btn">
          <FaPlus /> Write article
        </Link>
      </div>

      <div className="article-layout">
        <article className="article-main">
          <div className="article-meta-strip">
            <span className="article-kicker">post</span>
            <span className="article-read-time">
              <FaClock /> {estimatedReadTime}
            </span>
          </div>

          <h1 className="article-title">{activePost.title}</h1>

          <div className="article-author-shell">
            <Link to={`/profile/${activePost.username}`} className="post-author article-author-row">
              {activePost.avatar ? (
                <img src={activePost.avatar} alt="avatar" className="post-avatar" />
              ) : (
                <div className="avatar-fallback">{activePost.fullName.charAt(0)}</div>
              )}

              <div className="article-author-copy">
                <strong>{activePost.fullName}</strong>
                <span>@{activePost.username}</span>
              </div>
            </Link>

            {canFollowAuthor && (
              <FollowBtn
                isFollowing={Boolean(authorProfile?.isFollowing)}
                onClick={handleFollowToggle}
                disabled={followLoading}
              />
            )}
          </div>

          <div className="article-publish-meta" aria-label={publishedAt.full}>
            <span className="article-publish-day">{publishedAt.day}</span>
            <span>{publishedAt.date}</span>
            {publishedAt.time && <span>{publishedAt.time}</span>}
          </div>

          <div className="article-engagement-strip">
            <button
              type="button"
              className="article-engagement-pill article-comment-trigger"
              onClick={handleOpenComments}
            >
              <FaCommentDots />
              <span>
                {commentCount} comment{commentCount === 1 ? "" : "s"}
              </span>
            </button>
          </div>

          {activePost.media && (
            <div className="article-media-frame">
              {activePost.media.type === "image" ? (
                <img
                  src={activePost.media.url}
                  alt="post"
                  className="article-media"
                />
              ) : (
                <video
                  src={activePost.media.url}
                  controls
                  className="article-media"
                />
              )}
            </div>
          )}

          <div className="article-body">
            <div 
              className="article-content-rendered"
              dangerouslySetInnerHTML={{ __html: processedContent }} 
            />
          </div>

          {isOwner && (
            <div className="article-owner-actions">
              <Link to={`/edit/${activePost.id || activePost._id}`} className="owner-action-btn">
                <FaPen /> Edit article
              </Link>
              <button
                className="owner-action-btn danger"
                onClick={async () => {
                  try {
                    await deletePostApi(activePost.id || activePost._id);
                    window.location.href = "/home";
                  } catch {
                    window.alert("Database delete failed. Check backend/MongoDB.");
                  }
                }}
              >
                <FaTrash /> Delete article
              </button>
            </div>
          )}
        </article>

        <div
          ref={commentsPanelRef}
          className="comments-panel"
        >
          <div className="comments-header">
            <span className="comments-kicker">Discussion</span>
            <h2>Reader notes</h2>
            <span className="comments-count-pill">
              {commentCount} comment{commentCount === 1 ? "" : "s"}
            </span>
            <p>Responses, reactions, and follow-up thoughts on this article.</p>
            <button
              type="button"
              className="comments-toggle-btn"
              onClick={() => setCommentsOpen((current) => !current)}
            >
              {commentsOpen ? "Hide comments" : "Open comments"}
            </button>
          </div>
          <div className={`comments-body ${commentsOpen ? "open" : "closed"}`}>
            {commentsOpen && (
              <Comments
                postId={activePost.id || activePost._id}
                onCountChange={setCommentCount}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
