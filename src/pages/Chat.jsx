import React, { useState } from "react";
import Message from "../components/Message";
import "./CSS/Chat.css";

const dummyChats = [
  {
    id: 1,
    username: "rahul_shetty",
    messages: [
      { text: "Hey Ankit 👋", sender: "rahul_shetty" },
      { text: "How’s the project going?", sender: "rahul_shetty" },
      { text: "Going well!", sender: "me" },
    ],
  },
  {
    id: 2,
    username: "ankit_dev",
    messages: [
      { text: "Bro, did you push the code?", sender: "ankit_dev" },
    ],
  },
];

const Chat = () => {
  const [activeChat, setActiveChat] = useState(dummyChats[0]);
  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text.trim()) return;

    setActiveChat((prev) => ({
      ...prev,
      messages: [...prev.messages, { text, sender: "me" }],
    }));
    setText("");
  };

  return (
    <div className="messages-page">
      {/* Left: Chat list */}
      <aside className="chat-list">
        {dummyChats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${
              activeChat.id === chat.id ? "active" : ""
            }`}
            onClick={() => setActiveChat(chat)}
          >
            @{chat.username}
          </div>
        ))}
      </aside>

      {/* Right: Chat window */}
      <section className="chat-window">
        <div className="chat-header">
          @{activeChat.username}
        </div>

        <div className="chat-messages">
          {activeChat.messages.map((msg, i) => (
            <Message
              key={i}
              text={msg.text}
              sender={msg.sender}
              isOwn={msg.sender === "me"}
            />
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </section>
    </div>
  );
};

export default Chat;
