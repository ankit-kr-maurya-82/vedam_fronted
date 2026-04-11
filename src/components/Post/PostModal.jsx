import React from "react";
import Box from "../Box";
import "./postModal.css";

const PostModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h3>Create Post</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <Box />

      </div>
    </div>
  );
};

export default PostModal;
