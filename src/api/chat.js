import api, { apiBaseUrl } from "./axios";
import {
  getDirectMessageThreads,
  sendDirectMessage as sendLocalDirectMessage,
} from "../lib/chatStore";

const normalizeLocalThread = (thread) => {
  const messages = Array.isArray(thread?.messages) ? thread.messages : [];
  const lastMessage = messages[messages.length - 1] || null;

  return {
    id: thread?.id || "",
    contact: thread?.contact || null,
    lastMessage: lastMessage
      ? {
          ...lastMessage,
          isOwn: Boolean(lastMessage.isOwn),
        }
      : null,
    messages,
    updatedAt: thread?.updatedAt || lastMessage?.createdAt || null,
    unreadCount: 0,
  };
};

export const fetchChatConversations = async (currentUser) => {
  try {
    const response = await api.get("/chats");
    return response.data?.data?.conversations || [];
  } catch {
    return getDirectMessageThreads(currentUser).map(normalizeLocalThread);
  }
};

export const fetchChatMessages = async (currentUser, username) => {
  try {
    const response = await api.get(
      `/chats/${encodeURIComponent(username)}/messages`
    );
    return (
      response.data?.data || {
        contact: null,
        messages: [],
      }
    );
  } catch {
    const thread = getDirectMessageThreads(currentUser).find(
      (item) => item.contact.username.toLowerCase() === username.toLowerCase()
    );

    return {
      contact: thread?.contact || null,
      messages: thread?.messages || [],
    };
  }
};

export const sendChatMessage = async ({
  currentUser,
  username,
  contact,
  content,
}) => {
  try {
    const response = await api.post(
      `/chats/${encodeURIComponent(username)}/messages`,
      { content }
    );
    return response.data?.data;
  } catch {
    const thread = sendLocalDirectMessage({
      currentUser,
      contact,
      content,
    });

    return {
      contact,
      message: thread?.messages?.[thread.messages.length - 1] || null,
      thread,
    };
  }
};

export const buildChatStreamUrl = () => {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : "";
  const streamUrl = new URL(`${apiBaseUrl}/chats/stream`);

  if (token) {
    streamUrl.searchParams.set("accessToken", token);
  }

  return streamUrl.toString();
};

export const buildChatSocketUrl = () => new URL(apiBaseUrl).origin;
