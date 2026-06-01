import api from "./axios";
import {
  getPostsByUsername as getLocalPostsByUsername,
  getUserByUsername as getLocalUserByUsername,
  syncUserToStore,
} from "../lib/socialStore";

export const fetchProfileBundle = async (username) => {
  const normalized = username?.trim();
  if (!normalized) {
    return { user: null, posts: [] };
  }

  try {
    const [profileResponse, postsResponse] = await Promise.all([
      api.get(`/users/profile/${normalized}`),
      api.get(`/posts/user/${normalized}`),
    ]);

    const nextUser = syncUserToStore(profileResponse.data?.data);
    return {
      user: nextUser,
      posts: postsResponse.data?.posts || [],
    };
  } catch {
    return {
      user: getLocalUserByUsername(normalized),
      posts: getLocalPostsByUsername(normalized),
    };
  }
};

export const toggleFollowProfile = async (username) => {
  const normalized = username?.trim();
  if (!normalized) {
    throw new Error("Username is required");
  }

  const response = await api.post(`/users/profile/${normalized}/follow`);
  const profile = syncUserToStore(response.data?.data?.profile);
  const currentUser = syncUserToStore(response.data?.data?.currentUser);

  return {
    profile,
    currentUser,
    message: response.data?.message || "",
  };
};

export const updateProfile = async ({ fullName, username, bio, avatarFile, customization }) => {
  const formData = new FormData();

  if (typeof fullName === "string") {
    formData.append("fullName", fullName);
  }

  if (typeof username === "string") {
    formData.append("username", username);
  }

  if (typeof bio === "string") {
    formData.append("bio", bio);
  }

  if (avatarFile) {
    formData.append("avatar", avatarFile);
  }

  if (typeof customization === "object" && customization !== null) {
    formData.append("customization", JSON.stringify(customization));
  }

  const response = await api.patch("/users/profile", formData);

  return {
    user: syncUserToStore(response.data?.data),
    message: response.data?.message || "",
  };
};

export const getUserAnalytics = async () => {
  const response = await api.get("/users/analytics");
  return response.data?.data || null;
};

export const upgradeToPremium = async () => {
  const response = await api.post("/users/upgrade-premium");
  return response.data?.data || null;
};
