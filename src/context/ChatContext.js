import { createContext } from "react";

const ChatContext = createContext({
  unreadCount: 0,
  isRealtimeConnected: false,
  lastEvent: null,
  refreshChatState: async () => {},
  applyUnreadCountDelta: () => {},
  scheduleChatStateRefresh: () => {},
});

export default ChatContext;
