import React from "react";
import "./CSS/Message.css";

const Message = ({ text, sender, isOwn, timeLabel }) => {
  return (
    <div className={`message ${isOwn ? "own" : ""}`}>
      {!isOwn && <span className="sender">{sender}</span>}
      <p className="message-txt">{text}</p>
      {timeLabel ? <span className="message-time">{timeLabel}</span> : null}
    </div>
  );
};

export default Message;
