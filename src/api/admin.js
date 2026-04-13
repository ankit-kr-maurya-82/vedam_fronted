import api from "./axios.js";

export const getAdminStats = () => api.get("/admin/stats");
export const getUsersList = (page = 1, limit = 10, search = "") => 
  api.get("/admin/users", { params: { page, limit, search } });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getPostsList = (page = 1, limit = 10, search = "") => 
  api.get("/admin/posts", { params: { page, limit, search } });
export const deletePost = (id) => api.delete(`/admin/posts/${id}`);
export const getCommentsList = (page = 1, limit = 10, search = "") => 
  api.get("/admin/comments", { params: { page, limit, search } });
export const deleteComment = (id) => api.delete(`/admin/comments/${id}`);
export const updateSelfRole = (role) => api.patch("/users/me/role", { role });
