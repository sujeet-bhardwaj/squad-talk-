import React from "react";
import "./ChatHeader.css";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";

function ChatHeader() {
  return (
    <div className="chat-header">
      {/* Left Side: User Info */}
      <div className="chat-user">
        <img
          src="https://via.placeholder.com/50"
          alt="User"
          className="chat-user-pic"
        />
        <div className="chat-user-info">
          <h4>
            <span className="online-dot">🟢</span> Rahul
          </h4>
          <p>Online</p>
        </div>
      </div>

      {/* Right Side: Icons */}
      <div className="chat-actions">
        <FaPhoneAlt className="icon" />
        <FaVideo className="icon" />
      </div>
    </div>
  );
}

export default ChatHeader;
