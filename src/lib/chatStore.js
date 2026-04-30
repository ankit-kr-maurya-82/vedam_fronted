import { getAllUsers } from "./socialStore";

const CHAT_STORAGE_KEY = "social_direct_messages_v1";

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

const getEntityId = (value) => String(value?.id || value?._id || "");

const normalizeUser = (user = {}) => {
  const id = getEntityId(user);

  if (!id) {
    return null;
  }

  return {
    id,
    username: String(user.username || "").trim(),
    fullName: String(user.fullName || user.username || "").trim(),
    avatar: String(user.avatar || "").trim(),
    bio: String(user.bio || "").trim(),
  };
};

const getChatState = () => safeRead(CHAT_STORAGE_KEY, {});

const saveChatState = (state) => safeWrite(CHAT_STORAGE_KEY, state);

const buildThreadId = (currentUserId, contactId) =>
  ["direct", currentUserId, contactId].join(":");

const buildRelationshipIds = (currentUser) => {
  const relationshipIds = new Set();
  const relatedUsers = [
    ...(currentUser?.followerList || []),
    ...(currentUser?.followingList || []),
  ];

  relatedUsers.forEach((person) => {
    const id = getEntityId(person);
    if (id) {
      relationshipIds.add(id);
    }
  });

  return relationshipIds;
};

export const getChatContacts = (currentUser) => {
  const normalizedCurrentUser = normalizeUser(currentUser);

  if (!normalizedCurrentUser) {
    return [];
  }

  const relationshipIds = buildRelationshipIds(currentUser);
  const contactsMap = new Map();

  [
    ...(currentUser?.followingList || []),
    ...(currentUser?.followerList || []),
    ...getAllUsers(),
  ].forEach((candidate) => {
    const normalizedCandidate = normalizeUser(candidate);

    if (
      !normalizedCandidate ||
      normalizedCandidate.id === normalizedCurrentUser.id ||
      !normalizedCandidate.username
    ) {
      return;
    }

    const existing = contactsMap.get(normalizedCandidate.id);
    contactsMap.set(normalizedCandidate.id, {
      ...existing,
      ...normalizedCandidate,
      isConnection: relationshipIds.has(normalizedCandidate.id),
    });
  });

  return Array.from(contactsMap.values()).sort((left, right) => {
    if (left.isConnection !== right.isConnection) {
      return left.isConnection ? -1 : 1;
    }

    return (left.fullName || left.username).localeCompare(
      right.fullName || right.username
    );
  });
};

export const getDirectMessageThreads = (currentUser) => {
  const normalizedCurrentUser = normalizeUser(currentUser);

  if (!normalizedCurrentUser) {
    return [];
  }

  const chatState = getChatState();

  return getChatContacts(currentUser)
    .map((contact) => {
      const threadId = buildThreadId(normalizedCurrentUser.id, contact.id);
      const thread = chatState[threadId] || {};
      const messages = Array.isArray(thread.messages) ? thread.messages : [];
      const lastMessage = messages[messages.length - 1] || null;

      return {
        id: threadId,
        contact,
        messages,
        updatedAt: lastMessage?.createdAt || thread.updatedAt || null,
      };
    })
    .sort((left, right) => {
      if (left.updatedAt && right.updatedAt) {
        return new Date(right.updatedAt) - new Date(left.updatedAt);
      }

      if (left.updatedAt) return -1;
      if (right.updatedAt) return 1;

      return (left.contact.fullName || left.contact.username).localeCompare(
        right.contact.fullName || right.contact.username
      );
    });
};

export const sendDirectMessage = ({ currentUser, contact, content }) => {
  const normalizedCurrentUser = normalizeUser(currentUser);
  const normalizedContact = normalizeUser(contact);
  const nextContent = String(content || "").trim();

  if (!normalizedCurrentUser || !normalizedContact || !nextContent) {
    return null;
  }

  const threadId = buildThreadId(
    normalizedCurrentUser.id,
    normalizedContact.id
  );
  const chatState = getChatState();
  const existingThread = chatState[threadId] || {};
  const createdAt = new Date().toISOString();
  const nextMessage = {
    id: `msg_${Date.now()}`,
    text: nextContent,
    senderId: normalizedCurrentUser.id,
    senderUsername: normalizedCurrentUser.username,
    createdAt,
  };

  chatState[threadId] = {
    id: threadId,
    participantIds: [normalizedCurrentUser.id, normalizedContact.id],
    updatedAt: createdAt,
    messages: [...(existingThread.messages || []), nextMessage],
  };

  saveChatState(chatState);
  return chatState[threadId];
};
