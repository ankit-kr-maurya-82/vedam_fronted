const STORAGE_KEYS = {
  users: "social_users",
  posts: "social_posts",
  comments: "social_comments",
  currentUser: "user",
  accessToken: "accessToken",
};

const seedUsers = [];
const seedPosts = [];
const seedComments = {};

const safeRead = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const ensureSeed = () => {
  const users = safeRead(STORAGE_KEYS.users, null);
  const posts = safeRead(STORAGE_KEYS.posts, null);
  const comments = safeRead(STORAGE_KEYS.comments, null);

  if (!users) safeWrite(STORAGE_KEYS.users, seedUsers);
  if (!posts) safeWrite(STORAGE_KEYS.posts, seedPosts);
  if (!comments) safeWrite(STORAGE_KEYS.comments, seedComments);
};

const getUsers = () => {
  ensureSeed();
  return safeRead(STORAGE_KEYS.users, seedUsers);
};

const saveUsers = (users) => safeWrite(STORAGE_KEYS.users, users);

const getPosts = () => {
  ensureSeed();
  return safeRead(STORAGE_KEYS.posts, seedPosts);
};

const savePosts = (posts) => safeWrite(STORAGE_KEYS.posts, posts);

const getCommentsMap = () => {
  ensureSeed();
  return safeRead(STORAGE_KEYS.comments, seedComments);
};

const saveCommentsMap = (comments) => safeWrite(STORAGE_KEYS.comments, comments);
const saveCurrentUser = (user) => safeWrite(STORAGE_KEYS.currentUser, user);

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

const toPostViewModel = (post, users = getUsers()) => {
  const author = users.find((item) => item.id === post.authorId);
  return {
    ...post,
    _id: post.id,
    username: author?.username || "unknown_user",
    avatar: author?.avatar || "",
    fullName: author?.fullName || "Unknown User",
    bio: author?.bio || "",
    commentsCount: getComments(post.id).length,
  };
};

export const getFeedPosts = () =>
  getPosts()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((post) => toPostViewModel(post));

export const getPostById = (postId) => {
  const post = getPosts().find((item) => item.id === postId);
  return post ? toPostViewModel(post) : null;
};

export const getPostsByUsername = (username) =>
  getFeedPosts().filter((post) => post.username === username);

export const searchPosts = (query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return getFeedPosts();

  return getFeedPosts().filter(
    (post) =>
      post.title.toLowerCase().includes(normalized) ||
      post.content.toLowerCase().includes(normalized) ||
      post.username.toLowerCase().includes(normalized) ||
      post.fullName.toLowerCase().includes(normalized) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(normalized))
  );
};

export const searchUsers = (query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return getUsers();

  return getUsers().filter(
    (user) =>
      user.username?.toLowerCase().includes(normalized) ||
      user.fullName?.toLowerCase().includes(normalized) ||
      user.bio?.toLowerCase().includes(normalized)
  );
};

export const searchAll = (query) => ({
  users: searchUsers(query),
  posts: searchPosts(query),
});

export const getUserByUsername = (username) =>
  getUsers().find((user) => user.username === username) || null;

export const syncUserToStore = (user) => {
  if (!user?.id && !user?._id) return user;

  const normalizedFollowers = Array.isArray(user.followers)
    ? user.followers.length
    : user.followers ?? 0;
  const normalizedFollowing = Array.isArray(user.following)
    ? user.following.length
    : user.following ?? 0;
  const followerList = Array.isArray(user.followerList) ? user.followerList : [];
  const followingList = Array.isArray(user.followingList) ? user.followingList : [];

  const normalizedUser = {
    followers: normalizedFollowers,
    following: normalizedFollowing,
    followerList,
    followingList,
    bio: "",
    avatar: "",
    ...user,
    followers: normalizedFollowers,
    following: normalizedFollowing,
    followerList,
    followingList,
    id: user.id || user._id,
  };

  const users = getUsers();
  const exists = users.some((item) => item.id === normalizedUser.id);
  const nextUsers = exists
    ? users.map((item) =>
        item.id === normalizedUser.id ? { ...item, ...normalizedUser } : item
      )
    : [...users, normalizedUser];

  saveUsers(nextUsers);
  const currentUser = getCurrentUser();
  if (currentUser?.id === normalizedUser.id) {
    saveCurrentUser({ ...currentUser, ...normalizedUser });
  }
  return normalizedUser;
};

export const registerLocalUser = ({ fullName, username, email, password }) => {
  const users = getUsers();
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const alreadyExists = users.some(
    (user) =>
      user.username === normalizedUsername || user.email === normalizedEmail
  );

  if (alreadyExists) {
    throw new Error("User with email or username already exists");
  }

  const user = {
    id: `user_${Date.now()}`,
    fullName: fullName.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    avatar: "",
    bio: "Tell people what you are building.",
    followers: 0,
    following: 0,
  };

  saveUsers([...users, user]);
  return sanitizeUser(user);
};

export const loginLocalUser = ({ email, password }) => {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (item) => item.email === normalizedEmail && item.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const safeUser = sanitizeUser(user);
  window.localStorage.setItem(STORAGE_KEYS.accessToken, `demo-token-${user.id}`);
  window.localStorage.setItem(
    STORAGE_KEYS.currentUser,
    JSON.stringify(safeUser)
  );
  return safeUser;
};

export const logoutLocalUser = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.currentUser);
  window.localStorage.removeItem(STORAGE_KEYS.accessToken);
};

export const getCurrentUser = () => safeRead(STORAGE_KEYS.currentUser, null);

export const updateLocalUserProfile = (updates) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const users = getUsers();
  const hasCurrentUser = users.some((user) => user.id === currentUser.id);
  const baseUsers = hasCurrentUser ? users : [...users, currentUser];
  const nextUsers = baseUsers.map((user) =>
    user.id === currentUser.id ? { ...user, ...updates } : user
  );
  saveUsers(nextUsers);

  const nextCurrentUser = sanitizeUser(
    nextUsers.find((user) => user.id === currentUser.id)
  );
  window.localStorage.setItem(
    STORAGE_KEYS.currentUser,
    JSON.stringify(nextCurrentUser)
  );
  return nextCurrentUser;
};

export const createLocalPost = ({ title, content, media }) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("Login required");
  }

  const post = {
    id: `post_${Date.now()}`,
    title: title?.trim() || "Untitled Post",
    content: content.trim(),
    media: media || null,
    tags: [],
    authorId: currentUser.id,
    createdAt: new Date().toISOString(),
    likesCount: 0,
  };

  savePosts([post, ...getPosts()]);
  return toPostViewModel(post);
};

export const updateLocalPost = (postId, updates) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("Login required");
  }

  const posts = getPosts();
  const post = posts.find((item) => item.id === postId);

  if (!post) {
    throw new Error("Article not found");
  }

  if (post.authorId !== currentUser.id) {
    throw new Error("You can edit only your own article");
  }

  const nextPosts = posts.map((item) =>
    item.id === postId
      ? {
          ...item,
          ...updates,
          title: updates.title?.trim() || item.title,
          content: updates.content?.trim() || item.content,
          updatedAt: new Date().toISOString(),
        }
      : item
  );

  savePosts(nextPosts);
  return toPostViewModel(nextPosts.find((item) => item.id === postId));
};

export const deleteLocalPost = (postId) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("Login required");
  }

  const posts = getPosts();
  const post = posts.find((item) => item.id === postId);

  if (!post) {
    throw new Error("Article not found");
  }

  if (post.authorId !== currentUser.id) {
    throw new Error("You can delete only your own article");
  }

  savePosts(posts.filter((item) => item.id !== postId));

  const commentMap = getCommentsMap();
  if (commentMap[postId]) {
    const { [postId]: _removed, ...rest } = commentMap;
    saveCommentsMap(rest);
  }
};

export const getComments = (postId) => {
  const commentMap = getCommentsMap();
  return commentMap[postId] || [];
};

export const addComment = (postId, text) => {
  const currentUser = getCurrentUser();
  const nextComment = {
    id: `comment_${Date.now()}`,
    text,
    userId: currentUser?.id || null,
    userName: currentUser?.fullName || currentUser?.username || "Guest",
    user: {
      name: currentUser?.fullName || currentUser?.username || "Guest",
      avatar: currentUser?.avatar || "",
      username: currentUser?.username || "",
    },
    createdAt: new Date().toISOString(),
  };

  const commentMap = getCommentsMap();
  const nextMap = {
    ...commentMap,
    [postId]: [nextComment, ...(commentMap[postId] || [])],
  };
  saveCommentsMap(nextMap);
  return nextMap[postId];
};

export const deleteLocalComment = (postId, commentId) => {
  const currentUser = getCurrentUser();
  const commentMap = getCommentsMap();
  const comments = commentMap[postId] || [];

  const targetComment = comments.find((comment) => comment.id === commentId);
  if (!targetComment) {
    throw new Error("Comment not found");
  }

  if (
    targetComment.userId &&
    currentUser?.id &&
    targetComment.userId !== currentUser.id
  ) {
    throw new Error("You can delete only your own comment");
  }

  const nextComments = comments.filter((comment) => comment.id !== commentId);
  const nextMap = {
    ...commentMap,
    [postId]: nextComments,
  };

  saveCommentsMap(nextMap);
  return nextComments;
};
