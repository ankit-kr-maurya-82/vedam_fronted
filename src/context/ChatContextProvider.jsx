import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import {
  buildChatSocketUrl,
  buildChatStreamUrl,
  fetchChatConversations,
} from "../api/chat";
import ChatContext from "./ChatContext";
import UserContext from "./UserContext";

const CHAT_POLL_INTERVAL_MS = 1000;

const getUnreadCount = (conversations = []) =>
  conversations.reduce(
    (total, conversation) => total + Number(conversation?.unreadCount || 0),
    0
  );

const canUseBrowserNotifications = () =>
  typeof window !== "undefined" && "Notification" in window;

const getRealtimeEventKey = (payload) => {
  const messageId =
    payload?.message?.id ||
    payload?.message?._id ||
    payload?.deletedMessageId ||
    payload?.messageId;
  const contactId = payload?.contact?.id || payload?.contact?._id;
  const eventType = payload?.type || "chat:message";

  if (!messageId || !contactId) {
    return null;
  }

  return `${eventType}:${contactId}:${messageId}`;
};

const getConversationSnapshotKey = (conversation) =>
  String(
    conversation?.contact?.id ||
      conversation?.contact?._id ||
      conversation?.contact?.username ||
      ""
  ).toLowerCase();

const ChatContextProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const conversationSnapshotRef = useRef(new Map());
  const seenEventsRef = useRef(new Set());
  const socketConnectedRef = useRef(false);
  const streamConnectedRef = useRef(false);

  const syncRealtimeConnectionState = useCallback(() => {
    setIsRealtimeConnected(
      socketConnectedRef.current || streamConnectedRef.current
    );
  }, []);

  const showBrowserNotification = useCallback((payload) => {
    if (!canUseBrowserNotifications()) {
      return;
    }

    if (window.Notification.permission !== "granted") {
      return;
    }

    const notification = new window.Notification(
      payload?.contact?.fullName || payload?.contact?.username || "New message",
      {
        body: payload?.message?.text || "You received a new message",
        icon: payload?.contact?.avatar || undefined,
        tag: `chat:${payload?.contact?.username || "message"}`,
      }
    );

    notification.onclick = () => {
      window.focus();
      window.location.href = `/chat?user=${payload?.contact?.username || ""}`;
      notification.close();
    };
  }, []);

  const applyUnreadCountDelta = useCallback((delta) => {
    const nextDelta = Number(delta || 0);

    if (!nextDelta) {
      return;
    }

    setUnreadCount((previousCount) => Math.max(0, previousCount + nextDelta));
  }, []);

  const syncConversationSnapshot = useCallback((conversations = []) => {
    const nextSnapshot = new Map();

    conversations.forEach((conversation) => {
      const snapshotKey = getConversationSnapshotKey(conversation);

      if (!snapshotKey) {
        return;
      }

      nextSnapshot.set(snapshotKey, {
        lastMessageId:
          conversation?.lastMessage?.id || conversation?.lastMessage?._id || "",
        unreadCount: Number(conversation?.unreadCount || 0),
      });
    });

    conversationSnapshotRef.current = nextSnapshot;
  }, []);

  const refreshChatState = useCallback(
    async (options = {}) => {
      if (!user?.id) {
        setUnreadCount(0);
        conversationSnapshotRef.current = new Map();
        return [];
      }

      const conversations = await fetchChatConversations(user);
      setUnreadCount(getUnreadCount(conversations));

      if (options.syncSnapshot !== false) {
        syncConversationSnapshot(conversations);
      }

      return conversations;
    },
    [syncConversationSnapshot, user]
  );

  const scheduleChatStateRefresh = useCallback(
    (delay = 1200) => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }

      refreshTimerRef.current = window.setTimeout(() => {
        refreshTimerRef.current = null;
        refreshChatState().catch(() => {});
      }, Math.max(0, delay));
    },
    [refreshChatState]
  );

  const handleIncomingRealtimeEvent = useCallback(
    (payload, options = {}) => {
      const {
        adjustUnread = true,
        scheduleRefreshState = true,
        refreshDelay = 1200,
      } = options;
      const nextKey = getRealtimeEventKey(payload);

      if (nextKey && seenEventsRef.current.has(nextKey)) {
        return;
      }

      if (nextKey) {
        seenEventsRef.current.add(nextKey);

        if (seenEventsRef.current.size > 200) {
          const remainingKeys = Array.from(seenEventsRef.current).slice(-100);
          seenEventsRef.current = new Set(remainingKeys);
        }
      }

      setLastEvent({
        ...payload,
        receivedAt: Date.now(),
      });

      if (
        adjustUnread &&
        payload?.message?.senderId !== user.id &&
        payload?.contact?.username
      ) {
        applyUnreadCountDelta(1);
      }

      if (payload?.message?.senderId !== user.id && payload?.contact?.username) {
        toast.info(`New message from @${payload.contact.username}`);

        if (document.visibilityState !== "visible") {
          showBrowserNotification(payload);
        }
      }

      if (scheduleRefreshState) {
        scheduleChatStateRefresh(refreshDelay);
      }
    },
    [applyUnreadCountDelta, scheduleChatStateRefresh, showBrowserNotification, user]
  );

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      setLastEvent(null);
      setIsRealtimeConnected(false);
      socketConnectedRef.current = false;
      streamConnectedRef.current = false;
      socketRef.current?.disconnect?.();
      streamRef.current?.close?.();
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      socketRef.current = null;
      streamRef.current = null;
      conversationSnapshotRef.current = new Map();
      seenEventsRef.current = new Set();
      return;
    }

    refreshChatState();
  }, [refreshChatState, user]);

  useEffect(() => {
    if (!user?.id || !canUseBrowserNotifications()) {
      return;
    }

    if (window.Notification.permission === "default") {
      window.Notification.requestPermission().catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      conversationSnapshotRef.current = new Map();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let cancelled = false;

    const pollChats = async () => {
      try {
        const conversations = await fetchChatConversations(user);

        if (cancelled) {
          return;
        }

        setUnreadCount(getUnreadCount(conversations));

        const previousSnapshot = conversationSnapshotRef.current;
        const hasExistingSnapshot = previousSnapshot.size > 0;

        conversations.forEach((conversation) => {
          const snapshotKey = getConversationSnapshotKey(conversation);
          const nextMessageId =
            conversation?.lastMessage?.id || conversation?.lastMessage?._id || "";

          if (!snapshotKey || !nextMessageId || !hasExistingSnapshot) {
            return;
          }

          const previousConversation = previousSnapshot.get(snapshotKey);

          if (
            previousConversation?.lastMessageId &&
            previousConversation.lastMessageId !== nextMessageId
          ) {
            handleIncomingRealtimeEvent(
              {
                type: "chat:message",
                contact: conversation.contact,
                message: conversation.lastMessage,
                unread: Number(conversation?.unreadCount || 0) > 0,
              },
              {
                adjustUnread: false,
                scheduleRefreshState: false,
              }
            );
          }
        });

        syncConversationSnapshot(conversations);
      } catch {}
    };

    pollChats();
    const intervalId = window.setInterval(pollChats, CHAT_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [handleIncomingRealtimeEvent, syncConversationSnapshot, user]);

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    const token = window.localStorage.getItem("accessToken");
    seenEventsRef.current = new Set();

    const socket = io(buildChatSocketUrl(), {
      withCredentials: true,
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    const stream =
      typeof window !== "undefined" && "EventSource" in window
        ? new window.EventSource(buildChatStreamUrl())
        : null;

    socketRef.current = socket;
    streamRef.current = stream;

    socket.on("connect", () => {
      socketConnectedRef.current = true;
      syncRealtimeConnectionState();
    });

    socket.on("chat-message", (payload) => {
      handleIncomingRealtimeEvent(payload);
    });

    socket.on("disconnect", () => {
      socketConnectedRef.current = false;
      syncRealtimeConnectionState();
    });

    socket.on("connect_error", () => {
      socketConnectedRef.current = false;
      syncRealtimeConnectionState();
    });

    if (stream) {
      stream.addEventListener("connected", () => {
        streamConnectedRef.current = true;
        syncRealtimeConnectionState();
      });

      stream.addEventListener("chat-message", (event) => {
        try {
          handleIncomingRealtimeEvent(JSON.parse(event.data));
        } catch {}
      });

      stream.onerror = () => {
        streamConnectedRef.current = stream.readyState === window.EventSource.OPEN;
        syncRealtimeConnectionState();
      };
    }

    return () => {
      socket.disconnect();
      stream?.close();
      socketConnectedRef.current = false;
      streamConnectedRef.current = false;
      syncRealtimeConnectionState();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      if (streamRef.current === stream) {
        streamRef.current = null;
      }
    };
  }, [handleIncomingRealtimeEvent, showBrowserNotification, syncRealtimeConnectionState, user]);

  const value = useMemo(
    () => ({
      unreadCount,
      isRealtimeConnected,
      lastEvent,
      refreshChatState,
      applyUnreadCountDelta,
      scheduleChatStateRefresh,
    }),
    [
      applyUnreadCountDelta,
      isRealtimeConnected,
      lastEvent,
      refreshChatState,
      scheduleChatStateRefresh,
      unreadCount,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContextProvider;
