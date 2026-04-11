import api from "./axios";
import { searchAll as searchLocal } from "../lib/socialStore";

export const searchContent = async (query) => {
  const normalized = query.trim();

  if (!normalized) {
    return { users: [], posts: [] };
  }

  try {
    const response = await api.get(`/search?q=${encodeURIComponent(normalized)}`);
    return {
      users: response.data?.users || [],
      posts: response.data?.posts || [],
    };
  } catch {
    return searchLocal(normalized);
  }
};
