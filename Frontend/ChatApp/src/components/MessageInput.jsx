import React, { useState } from "react";
import "./MessageInput.css";
import { FaSmile, FaPaperPlane } from "react-icons/fa";

function MessageInput() {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() !== "") {
      console.log("Message Sent:", text);
      setText("");
    }
  };

  return (
    <div className="message-input">
      {/* Emoji Button */}
      <button className="emoji-btn">
        <FaSmile />
      </button>

      {/* Input Box */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type Message..."
      />

      {/* Send Button */}
      <button className="send-btn" onClick={handleSend}>
        <FaPaperPlane />
      </button>
    </div>
  );
}

export default MessageInput;
