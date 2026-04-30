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

const getUnreadCount = (conversations = []) =>
  conversations.reduce(
    (total, conversation) => total + Number(conversation?.unreadCount || 0),
    0
  );

const canUseBrowserNotifications = () =>
  typeof window !== "undefined" && "Notification" in window;

const getRealtimeEventKey = (payload) => {
  const messageId = payload?.message?.id || payload?.message?._id;
  const contactId = payload?.contact?.id || payload?.contact?._id;

  if (!messageId || !contactId) {
    return null;
  }

  return `${contactId}:${messageId}`;
};

const ChatContextProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
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

  const refreshChatState = useCallback(async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return [];
    }

    const conversations = await fetchChatConversations(user);
    setUnreadCount(getUnreadCount(conversations));
    return conversations;
  }, [user]);

  const handleIncomingRealtimeEvent = useCallback(
    (payload) => {
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

      if (payload?.message?.senderId !== user.id && payload?.contact?.username) {
        toast.info(`New message from @${payload.contact.username}`);

        if (document.visibilityState !== "visible") {
          showBrowserNotification(payload);
        }
      }

      refreshChatState().catch(() => {});
    },
    [refreshChatState, showBrowserNotification, user]
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
      socketRef.current = null;
      streamRef.current = null;
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
    }),
    [isRealtimeConnected, lastEvent, refreshChatState, unreadCount]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContextProvider;
