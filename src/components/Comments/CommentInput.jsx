import React, { useState } from "react";

const CommentInput = ({ onAdd, disabled = false, loading = false }) => {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim() || disabled || loading) return;

    const shouldClear = await onAdd(text);
    if (shouldClear !== false) {
      setText("");
    }
  };

  return (
    <div className="comment-input-row">
      <input
        type="text"
        placeholder={disabled ? "Login to add a comment..." : "Add a comment..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className="comment-input-field"
        disabled={disabled || loading}
      />
      <button
        onClick={handleSubmit}
        className="comment-submit-btn"
        disabled={disabled || loading}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
};

export default CommentInput;
