import React, { useContext, useEffect, useState } from "react";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";
import api from "../../api/axios";
import UserContext from "../../context/UserContext";
import {
  addComment as addLocalComment,
  deleteLocalComment,
  getComments as getLocalComments,
} from "../../lib/socialStore";

const normalizeComment = (comment, fallbackUser = null) => {
  if (!comment) return null;

  const owner =
    comment.owner && typeof comment.owner === "object" ? comment.owner : null;
  const fallbackUserId = fallbackUser?.id || fallbackUser?._id || null;
  const userId =
    owner?._id ||
    (typeof comment.owner === "string" ? comment.owner : null) ||
    comment.userId ||
    fallbackUserId;
  const userName =
    owner?.fullName ||
    owner?.username ||
    comment.user?.name ||
    comment.userName ||
    fallbackUser?.fullName ||
    fallbackUser?.username ||
    "Anonymous";

  return {
    id: comment._id || comment.id,
    text: comment.content || comment.text || "",
    createdAt: comment.createdAt,
    userId,
    userName,
    user: {
      name: userName,
      avatar: owner?.avatar || comment.user?.avatar || fallbackUser?.avatar || "",
      username:
        owner?.username || comment.user?.username || fallbackUser?.username || "",
    },
  };
};

const Comments = ({ postId, onCountChange }) => {
  const { user } = useContext(UserContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    onCountChange?.(comments.length);
  }, [comments, onCountChange]);

  useEffect(() => {
    let cancelled = false;

    const loadComments = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/comments/post/${postId}`);
        if (!cancelled) {
          setComments(
            (response.data?.data || []).map((comment) => normalizeComment(comment)).filter(Boolean)
          );
        }
      } catch {
        if (!cancelled) {
          setComments(getLocalComments(postId).map(normalizeComment).filter(Boolean));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const handleAddComment = async (text) => {
    setError("");
    setPosting(true);

    try {
      const response = await api.post(`/comments/post/${postId}`, {
        content: text,
      });
      const nextComment = normalizeComment(response.data?.data, user);
      if (!nextComment) {
        throw new Error("Invalid comment response");
      }
      setComments((prev) => [nextComment, ...prev]);
      return true;
    } catch (requestError) {
      if (requestError.response) {
        setError(
          requestError.response?.data?.message || "Unable to add comment."
        );
        return false;
      }

      try {
        setComments(addLocalComment(postId, text).map(normalizeComment).filter(Boolean));
        return true;
      } catch (localError) {
        setError(localError.message || "Unable to add comment.");
        return false;
      }
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setError("");
    setDeletingId(commentId);

    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (requestError) {
      if (requestError.response) {
        setError(
          requestError.response?.data?.message || "Unable to delete comment."
        );
        return;
      }

      try {
        setComments(deleteLocalComment(postId, commentId).map(normalizeComment).filter(Boolean));
      } catch (localError) {
        setError(localError.message || "Unable to delete comment.");
      }
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="mt-3">
      <CommentInput onAdd={handleAddComment} disabled={!user} loading={posting} />

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {loading && <p className="text-sm text-slate-500 mb-3">Loading comments...</p>}
      {!loading && comments.length === 0 && (
        <p className="text-sm text-slate-500 mb-3">No comments yet.</p>
      )}

      <div className="space-y-2">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            canDelete={user?.id === comment.userId || user?._id === comment.userId}
            deleting={deletingId === comment.id}
            onDelete={handleDeleteComment}
          />
        ))}
      </div>
    </div>
  );
};

export default Comments;
