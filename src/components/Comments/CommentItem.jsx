import React from "react";
import { FaTrash } from "react-icons/fa";

const CommentItem = ({ comment, canDelete = false, onDelete, deleting = false }) => {
  const avatar = comment.user?.avatar || "";
  const name = comment.user?.name || comment.userName || "Anonymous";

  return (
    <div className="border overflow-hidden p-3 rounded bg-white">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <span className="font-semibold block">{name}</span>
            {comment.user?.username && (
              <span className="text-xs text-slate-500">@{comment.user.username}</span>
            )}
          </div>
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete(comment.id)}
            disabled={deleting}
            className="text-sm text-red-600 inline-flex items-center gap-1"
          >
            <FaTrash /> {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      <p className="text-sm text-slate-700">{comment.text}</p>
    </div>
  );
};

export default CommentItem;
