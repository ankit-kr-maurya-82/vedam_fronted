
import React, { useState } from "react";
import { likePost } from "../../api/post.api";

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes.length);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    try {
      const res = await likePost(post._id);
      setLikes(res.data.data.likesCount);
      setLiked(res.data.data.liked);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-900  p-4 rounded-xl border border-gray-800">
      {/* Owner */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={post.owner.avatar || "https://via.placeholder.com/40"}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h4 className="text-white font-semibold">
            {post.owner.fullName}
          </h4>
          <p className="text-gray-400 text-sm">
            @{post.owner.username}
          </p>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg text-white font-medium">{post.title}</h3>
      <p className="text-gray-300 mt-1">{post.content}</p>

      {/* Actions */}
      <div className="flex gap-4 mt-3 text-gray-400 text-sm">
        <button
          onClick={handleLike}
          className={`hover:text-red-400 ${liked && "text-red-500"}`}
        >
          ❤️ {likes}
        </button>
        <span>💬 {post.commentsCount}</span>
        <span>👁️ {post.views}</span>
      </div>
    </div>
  );
};

export default PostCard;
