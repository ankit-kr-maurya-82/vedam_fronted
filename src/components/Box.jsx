import { useState } from "react";
import { createPost } from "../api/post.api.js";

const Box = ({ onPostCreated }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async () => {
    if (!title || !content) return;

    try {
      setLoading(true);
      const newPost = await createPost({ title, content });

      onPostCreated(newPost); // 🔥 Home ko update
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Post create failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 mt-[12%] h-fit border border-gray-800 rounded-xl p-4 mb-6">
      <input
        className="w-full bg-gray-800 text-white p-2 rounded mb-2"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      

      <textarea
        className="w-full bg-gray-800 resize-none h-62 text-white p-2 rounded"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={submitHandler}
        disabled={loading}
        className="mt-3 bg-amber-500 text-black px-4 py-2 rounded"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
};

export default Box;
