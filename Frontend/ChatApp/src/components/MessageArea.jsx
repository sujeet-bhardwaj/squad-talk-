import React from "react";
import "./MessageArea.css";

function MessageArea() {
  const messages = [
    { text: "Hello Rahul", sender: "me" },
    { text: "Hi Sujeet", sender: "other" },
    { text: "How are you?", sender: "other" },
    { text: "I’m good, thanks!", sender: "me" },
  ];

  return (
    <div className="message-area">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${msg.sender === "me" ? "sent" : "received"}`}
        >
          <p>{msg.text}</p>
        </div>
      ))}
    </div>
  );
}

export default MessageArea;
