import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { buildChatStreamUrl, fetchChatConversations } from "../api/chat";
import ChatContext from "./ChatContext";
import UserContext from "./UserContext";

const getUnreadCount = (conversations = []) =>
  conversations.reduce(
    (total, conversation) => total + Number(conversation?.unreadCount || 0),
    0
  );

const canUseBrowserNotifications = () =>
  typeof window !== "undefined" && "Notification" in window;

const ChatContextProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const sourceRef = useRef(null);

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

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      setLastEvent(null);
      setIsRealtimeConnected(false);
      sourceRef.current?.close?.();
      sourceRef.current = null;
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

    const source = new EventSource(buildChatStreamUrl(), {
      withCredentials: true,
    });

    sourceRef.current = source;

    source.addEventListener("connected", () => {
      setIsRealtimeConnected(true);
    });

    source.addEventListener("chat-message", async (event) => {
      const payload = JSON.parse(event.data);
      setLastEvent({
        ...payload,
        receivedAt: Date.now(),
      });

      await refreshChatState();

      if (payload?.message?.senderId !== user.id && payload?.contact?.username) {
        toast.info(`New message from @${payload.contact.username}`);

        if (document.visibilityState !== "visible") {
          showBrowserNotification(payload);
        }
      }
    });

    source.onerror = () => {
      setIsRealtimeConnected(false);
    };

    return () => {
      source.close();
      if (sourceRef.current === source) {
        sourceRef.current = null;
      }
    };
  }, [refreshChatState, showBrowserNotification, user]);

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
