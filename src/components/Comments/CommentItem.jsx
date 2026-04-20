import React from "react";
import { FaTrash } from "react-icons/fa";

const CommentItem = ({ comment, canDelete = false, onDelete, deleting = false }) => {
  const avatar = comment.user?.avatar || "";
  const name = comment.user?.name || comment.userName || "Anonymous";

  return (
    <div className="comment-card">
      <div className="comment-card-head">
        <div className="comment-card-meta">
          {avatar ? (
            <img src={avatar} alt="avatar" className="comment-avatar" />
          ) : (
            <div className="comment-avatar-fallback">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <span className="comment-card-name">{name}</span>
            {comment.user?.username && (
              <span className="comment-card-username">@{comment.user.username}</span>
            )}
          </div>
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete(comment.id)}
            disabled={deleting}
            className="comment-delete-btn"
          >
            <FaTrash /> {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      <p className="comment-card-text">{comment.text}</p>
    </div>
  );
};

export default CommentItem;
