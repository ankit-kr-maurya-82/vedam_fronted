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

const ChatContextProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const sourceRef = useRef(null);

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
  }, [refreshChatState, user]);

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
