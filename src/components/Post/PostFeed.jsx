import React, { useEffect, useState } from "react";
import { fetchPosts } from "../../api/post.api";
import PostCard from "./PostCard";

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await fetchPosts();
        setPosts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;

  return (
    <div className="flex  flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostFeed;
