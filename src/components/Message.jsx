import React from "react";
import "./CSS/Message.css";

const Message = ({
  text,
  sender,
  isOwn,
  timeLabel,
  isEdited = false,
  pending = false,
  onEdit,
  onDelete,
  disableActions = false,
}) => {
  return (
    <div className={`message ${isOwn ? "own" : ""}`}>
      {!isOwn && <span className="sender">{sender}</span>}
      {isOwn && (onEdit || onDelete) ? (
        <div className="message-actions">
          {onEdit ? (
            <button
              type="button"
              className="message-action-btn"
              onClick={onEdit}
              disabled={disableActions}
            >
              Edit
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              className="message-action-btn delete"
              onClick={onDelete}
              disabled={disableActions}
            >
              Delete
            </button>
          ) : null}
        </div>
      ) : null}
      <p className="message-txt">{text}</p>
      {timeLabel ? (
        <span className="message-time">
          {pending ? "Sending..." : timeLabel}
          {isEdited && !pending ? " · Edited" : ""}
        </span>
      ) : null}
    </div>
  );
};

export default Message;
