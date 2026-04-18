import React, { useState } from "react";
import { likePost } from "../../api/post.api";
import "./PostCard.css"; // Import CSS for line-clamp if using OPTION 2

/* 🔥 Reusable truncate function */
const truncateText = (text, maxLength = 45) => {
  if (!text) return "No content";
  return text.length > maxLength
    ? text.slice(0, maxLength).trim() + "..."
    : text;
};

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(
    post.likesCount ?? post.likes?.length ?? 0
  );
  const [liked, setLiked] = useState(Boolean(post.liked));

  const handleLike = async () => {
    try {
      const res = await likePost(post._id);
      setLikes(res.likesCount ?? likes);
      setLiked(res.liked ?? liked);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition">

      {/* 👤 Owner */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={post.owner?.avatar || "https://via.placeholder.com/40"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h4 className="text-white font-semibold">
            {post.owner?.fullName || "Unknown"}
          </h4>
          <p className="text-gray-400 text-sm">
            @{post.owner?.username || "user"}
          </p>
        </div>
      </div>

      {/* 📝 Content */}
      <h3 className="text-lg text-white font-medium mb-1">
        {post.title}
      </h3>

      {/* OPTION 1: simple truncate */}
      <p className="text-gray-400 text-sm mb-2">
        {truncateText(post.content, 45)}
      </p>

      {/* OPTION 2 (BEST): line clamp (uncomment if using CSS below) */}
      {/*
      <p className="text-gray-400 text-sm mb-2 line-clamp-2">
        {post.content || "No content"}
      </p>
      */}

      {/* ❤️ Actions */}
      <div className="flex gap-4 mt-2 text-gray-400 text-sm">
        <button
          onClick={handleLike}
          className={`hover:text-red-400 transition ${
            liked ? "text-red-500" : ""
          }`}
        >
          ❤️ {likes}
        </button>

        <span>💬 {post.commentsCount ?? 0}</span>
        <span>👁️ {post.views ?? 0}</span>
      </div>
    </div>
  );
};

export default PostCard;