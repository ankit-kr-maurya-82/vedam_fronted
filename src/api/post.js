import api from "./axios";

export const fetchPostById = async (postId) => {
  const response = await api.get(`/posts/${postId}`);
  return response.data?.post || null;
};

export const incrementPostView = async (postId) => {
  const response = await api.post(`/posts/${postId}/view`);
  return response.data?.post || null;
};

export const createPostApi = async (formData) => {
  const response = await api.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data?.post || null;
};

export const updatePostApi = async (postId, formData) => {
  const response = await api.put(`/posts/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data?.post || null;
};

export const deletePostApi = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};
