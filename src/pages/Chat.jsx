import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Message from "../components/Message";
import ChatContext from "../context/ChatContext";
import UserContext from "../context/UserContext";
import {
  fetchChatMessages,
  sendChatMessage,
} from "../api/chat";
import "./CSS/Chat.css";

const formatMessageTime = (value) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  }).format(new Date(value));
};

const formatConversationTime = (value) => {
  if (!value) return "New chat";

  const date = new Date(value);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return formatMessageTime(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
};

const getInitial = (thread) =>
  (thread?.contact?.fullName || thread?.contact?.username || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

const sortMessagesByTime = (messages = []) =>
  [...messages].sort((left, right) => {
    const leftTime = new Date(left?.createdAt || 0).getTime();
    const rightTime = new Date(right?.createdAt || 0).getTime();
    return leftTime - rightTime;
  });

const normalizeConversation = (conversation) => ({
  ...conversation,
  messages: sortMessagesByTime(conversation?.messages || []),
});

const mergeConversationMessages = (
  messages = [],
  nextMessage,
  currentUserId
) => {
  if (!nextMessage?.id && !nextMessage?.text) {
    return sortMessagesByTime(messages);
  }

  const nextMessages = [...messages];
  const existingIndex = nextMessages.findIndex(
    (message) => message.id === nextMessage.id
  );

  if (existingIndex >= 0) {
    nextMessages.splice(existingIndex, 1, {
      ...nextMessages[existingIndex],
      ...nextMessage,
      pending: false,
    });

    return sortMessagesByTime(nextMessages);
  }

  const pendingMatchIndex =
    nextMessage.senderId === currentUserId
      ? nextMessages.findIndex(
          (message) =>
            message.pending &&
            message.senderId === currentUserId &&
            message.text === nextMessage.text
        )
      : -1;

  if (pendingMatchIndex >= 0) {
    nextMessages.splice(pendingMatchIndex, 1, {
      ...nextMessages[pendingMatchIndex],
      ...nextMessage,
      pending: false,
    });

    return sortMessagesByTime(nextMessages);
  }

  return sortMessagesByTime([...nextMessages, nextMessage]);
};

const mergeConversationState = (
  conversation,
  contact,
  nextMessage,
  currentUserId
) =>
  normalizeConversation({
    contact: conversation?.contact
      ? {
          ...conversation.contact,
          ...contact,
        }
      : contact,
    messages: mergeConversationMessages(
      conversation?.messages || [],
      nextMessage,
      currentUserId
    ),
  });

const upsertThreadFromMessage = (
  threads = [],
  eventPayload,
  currentUserId,
  options = {}
) => {
  if (!eventPayload?.contact?.username || !eventPayload?.message) {
    return threads;
  }

  const { resetUnread = false } = options;
  const nextThreads = [...threads];
  const targetIndex = nextThreads.findIndex(
    (thread) =>
      thread.contact.username.toLowerCase() ===
      eventPayload.contact.username.toLowerCase()
  );

  const nextThread = {
    id:
      nextThreads[targetIndex]?.id ||
      `direct:${currentUserId}:${eventPayload.contact.id || eventPayload.contact._id}`,
    contact: {
      ...(nextThreads[targetIndex]?.contact || {}),
      ...eventPayload.contact,
    },
    lastMessage: eventPayload.message,
    updatedAt: eventPayload.message.createdAt || eventPayload.message.updatedAt,
    unreadCount:
      resetUnread || eventPayload.message.senderId === currentUserId
        ? 0
        : (nextThreads[targetIndex]?.unreadCount || 0) + 1,
  };

  if (targetIndex >= 0) {
    nextThreads.splice(targetIndex, 1);
  }

  return [nextThread, ...nextThreads];
};

const createOptimisticMessage = (currentUser, text) => {
  const createdAt = new Date().toISOString();

  return {
    id: `temp:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    text,
    content: text,
    senderId: currentUser.id,
    senderUsername: currentUser.username,
    createdAt,
    updatedAt: createdAt,
    isOwn: true,
    pending: true,
  };
};

const Chat = () => {
  const { user, loading } = useContext(UserContext);
  const {
    lastEvent,
    isRealtimeConnected,
    refreshChatState,
    applyUnreadCountDelta,
    scheduleChatStateRefresh,
  } =
    useContext(ChatContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 768px)").matches
      : false
  );
  const [threads, setThreads] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [threadLoading, setThreadLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user?.id) {
      setThreads([]);
      setActiveConversation(null);
      setThreadLoading(false);
      return;
    }

    let cancelled = false;

    const loadThreads = async (showLoader = true) => {
      if (showLoader) {
        setThreadLoading(true);
      }

      const nextThreads = await refreshChatState();

      if (!cancelled) {
        setThreads(nextThreads);
        if (showLoader) {
          setThreadLoading(false);
        }
      }
    };

    loadThreads();

    const syncThreads = async (event) => {
      if (
        event.key &&
        !["social_direct_messages_v1", "social_users", "user"].includes(event.key)
      ) {
        return;
      }

      const nextThreads = await refreshChatState();
      if (!cancelled) {
        setThreads(nextThreads);
      }
    };

    window.addEventListener("storage", syncThreads);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", syncThreads);
    };
  }, [refreshChatState, user]);

  const selectedUsername = searchParams.get("user")?.trim().toLowerCase() || "";

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const syncViewport = (event) => {
      setIsMobileView(event.matches);
    };

    setIsMobileView(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncViewport);
      return () => mediaQuery.removeEventListener("change", syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  const filteredThreads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return threads;
    }

    return threads.filter((thread) => {
      const lastMessage =
        thread.lastMessage || thread.messages?.[thread.messages.length - 1];
      const searchBody = [
        thread.contact.fullName,
        thread.contact.username,
        lastMessage?.text,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchBody.includes(normalizedSearch);
    });
  }, [search, threads]);

  const activeThread = useMemo(() => {
    if (!threads.length || (isMobileView && !selectedUsername)) {
      return null;
    }

    return (
      threads.find(
        (thread) => thread.contact.username.toLowerCase() === selectedUsername
      ) || threads[0]
    );
  }, [isMobileView, selectedUsername, threads]);

  useEffect(() => {
    if (!threads.length || selectedUsername || isMobileView) {
      return;
    }

    setSearchParams({ user: threads[0].contact.username }, { replace: true });
  }, [isMobileView, selectedUsername, setSearchParams, threads]);

  useEffect(() => {
    if (!user?.id || !activeThread?.contact?.username) {
      setActiveConversation(null);
      return;
    }

    let cancelled = false;
    const unreadToClear = Number(activeThread.unreadCount || 0);

    const loadConversation = async () => {
      setConversationLoading(true);
      const nextConversation = await fetchChatMessages(
        user,
        activeThread.contact.username
      );

      if (!cancelled) {
        setActiveConversation(normalizeConversation(nextConversation));
        applyUnreadCountDelta(-unreadToClear);
        setThreads((previousThreads) =>
          previousThreads.map((thread) =>
            thread.contact.username.toLowerCase() ===
            activeThread.contact.username.toLowerCase()
              ? { ...thread, unreadCount: 0 }
              : thread
          )
        );
        setConversationLoading(false);
      }
    };

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [activeThread?.contact?.username, activeThread?.unreadCount, applyUnreadCountDelta, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.contact?.username, activeConversation?.messages?.length]);

  useEffect(() => {
    if (!user?.id || !lastEvent?.contact?.username) {
      return;
    }

    const isViewingActiveThread =
      activeThread?.contact?.username?.toLowerCase() ===
      lastEvent.contact.username.toLowerCase();

    setThreads((previousThreads) =>
      upsertThreadFromMessage(previousThreads, lastEvent, user.id, {
        resetUnread: isViewingActiveThread,
      })
    );

    if (isViewingActiveThread) {
      if (lastEvent.message.senderId !== user.id) {
        applyUnreadCountDelta(-1);
      }

      setActiveConversation((previousConversation) => {
        return mergeConversationState(
          previousConversation,
          lastEvent.contact,
          lastEvent.message,
          user.id
        );
      });
    }
  }, [activeThread?.contact?.username, applyUnreadCountDelta, lastEvent, user]);

  const handleSelectThread = (username) => {
    setSearchParams({ user: username });
  };

  const handleBackToList = () => {
    setSearchParams({}, { replace: true });
  };

  const handleSendMessage = async () => {
    if (!user?.id || !activeThread || !draft.trim() || sending) {
      return;
    }

    setSending(true);

    const nextDraft = draft.trim();
    const optimisticMessage = createOptimisticMessage(user, nextDraft);
    setDraft("");
    setThreads((previousThreads) =>
      upsertThreadFromMessage(
        previousThreads,
        {
          contact: activeThread.contact,
          message: optimisticMessage,
        },
        user.id,
        { resetUnread: true }
      )
    );
    setActiveConversation((previousConversation) =>
      mergeConversationState(
        previousConversation,
        activeThread.contact,
        optimisticMessage,
        user.id
      )
    );

    try {
      const result = await sendChatMessage({
        currentUser: user,
        username: activeThread.contact.username,
        contact: activeThread.contact,
        content: nextDraft,
      });

      if (result?.message) {
        const payload = {
          contact: result.contact || activeThread.contact,
          message: result.message,
        };

        setThreads((previousThreads) =>
          upsertThreadFromMessage(previousThreads, payload, user.id, {
            resetUnread: true,
          })
        );
        setActiveConversation((previousConversation) =>
          mergeConversationState(
            previousConversation,
            payload.contact,
            payload.message,
            user.id
          )
        );
      }

      scheduleChatStateRefresh(800);
    } finally {
      setSending(false);
    }
  };

  if (loading || threadLoading) {
    return <div className="chat-shell-state">Loading conversations...</div>;
  }

  if (!user?.id) {
    return (
      <div className="chat-shell-state">
        <div className="chat-state-card">
          <h2>Login required</h2>
          <p>Sign in to start chatting with people you follow or discover in the app.</p>
          <Link to="/login" className="chat-state-link">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`messages-page ${
        isMobileView
          ? selectedUsername
            ? "mobile-show-thread"
            : "mobile-show-list"
          : ""
      }`}
    >
      <aside className="chat-list">
        <div className="chat-list-top">
          <div>
            <p className="chat-eyebrow">Direct messages</p>
            <h1>Chats</h1>
            <span className={`chat-live-status ${isRealtimeConnected ? "online" : ""}`}>
              {isRealtimeConnected ? "Live updates on" : "Realtime reconnecting"}
            </span>
          </div>

          <span className="chat-count">
            {threads.length} {threads.length === 1 ? "thread" : "threads"}
          </span>
        </div>

        <div className="chat-search">
          <input
            type="text"
            placeholder="Search people or messages"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="chat-list-scroll">
          {!threads.length ? (
            <div className="chat-empty-list">
              <h3>No chats yet</h3>
              <p>
                No people are available for chat yet. As more users join, they will
                appear here automatically.
              </p>
            </div>
          ) : !filteredThreads.length ? (
            <div className="chat-empty-list compact">
              <p>No conversations match "{search}".</p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const lastMessage =
                thread.lastMessage || thread.messages?.[thread.messages.length - 1];
              const isActive =
                activeThread?.contact.username === thread.contact.username;

              return (
                <button
                  key={thread.id}
                  type="button"
                  className={`chat-item ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectThread(thread.contact.username)}
                >
                  <div className="chat-avatar">
                    {thread.contact.avatar ? (
                      <img
                        src={thread.contact.avatar}
                        alt={thread.contact.username}
                        className="chat-avatar-image"
                      />
                    ) : (
                      <span>{getInitial(thread)}</span>
                    )}
                  </div>

                  <div className="chat-item-copy">
                    <div className="chat-item-head">
                      <strong>{thread.contact.fullName || thread.contact.username}</strong>
                      <div className="chat-item-meta">
                        {thread.unreadCount > 0 ? (
                          <span className="chat-unread-dot">{thread.unreadCount}</span>
                        ) : null}
                        <span>{formatConversationTime(thread.updatedAt)}</span>
                      </div>
                    </div>
                    <span className="chat-item-username">
                      @{thread.contact.username}
                    </span>
                    <p className="chat-item-preview">
                      {lastMessage
                        ? lastMessage.senderId === user.id || lastMessage.isOwn
                          ? `You: ${lastMessage.text}`
                          : lastMessage.text
                        : "Start the conversation"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="chat-window">
        {activeThread ? (
          <>
            <div className="chat-header">
              <div className="chat-header-profile">
                {isMobileView ? (
                  <button
                    type="button"
                    className="chat-mobile-back"
                    onClick={handleBackToList}
                  >
                    Back
                  </button>
                ) : null}

                <div className="chat-avatar large">
                  {activeThread.contact.avatar ? (
                    <img
                      src={activeThread.contact.avatar}
                      alt={activeThread.contact.username}
                      className="chat-avatar-image"
                    />
                  ) : (
                    <span>{getInitial(activeThread)}</span>
                  )}
                </div>

                <div>
                  {isMobileView ? (
                    <span className="chat-mobile-label">Conversation</span>
                  ) : null}
                  <h2>{activeThread.contact.fullName || activeThread.contact.username}</h2>
                  <p>@{activeThread.contact.username}</p>
                </div>
              </div>

              <Link
                to={`/profile/${activeThread.contact.username}`}
                className="chat-profile-link"
              >
                View profile
              </Link>
            </div>

            <div className="chat-messages">
              <div className="chat-message-stack">
                {conversationLoading ? (
                  <div className="chat-empty-thread">
                    <h3>Loading messages...</h3>
                    <p>Fetching your conversation history.</p>
                  </div>
                ) : activeConversation?.messages?.length ? (
                  activeConversation.messages.map((message) => (
                    <Message
                      key={message.id}
                      text={message.text}
                      sender={activeThread.contact.fullName || activeThread.contact.username}
                      isOwn={message.senderId === user.id || message.isOwn}
                      timeLabel={formatMessageTime(message.createdAt)}
                    />
                  ))
                ) : (
                  <div className="chat-empty-thread">
                    <h3>Say hello to @{activeThread.contact.username}</h3>
                    <p>This thread is ready whenever you want to start the conversation.</p>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="chat-input">
              <textarea
                rows="1"
                placeholder={`Message @${activeThread.contact.username}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button onClick={handleSendMessage} disabled={!draft.trim() || sending}>
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        ) : (
          <div className="chat-empty-thread wide">
            <h2>No conversation selected</h2>
            <p>Choose a person from the left to start chatting.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Chat;
