import React from "react";
import "./CSS/FollowBtn.css";

const FollowBtn = ({ isFollowing = false, onClick, disabled = false }) => {
  return (
    <button
      type="button"
      className={isFollowing ? "following" : "follow"}
      onClick={onClick}
      disabled={disabled}
    >
      {disabled ? "Working..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowBtn;
