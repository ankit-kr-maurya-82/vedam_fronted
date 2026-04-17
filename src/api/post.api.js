import api from "./axios"; // axios instance with baseURL + token

// Get all posts
export const fetchPosts = async () => {
  const res = await api.get("/posts");
  return res.data?.posts?.filter(p => !p.isAdminOnly) || [];
};

// Like / Unlike post
export const likePost = async (postId) => {
  const res = await api.post(`/posts/${postId}/like`);
  return res.data?.data || { likesCount: 0, liked: false };
};

// Create new post
export const createPost = async (data) => {
  const res = await api.post("/posts", data);
  return res.data;
};
