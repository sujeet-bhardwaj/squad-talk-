import React from "react";
import "./Sidebar.css";

import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { useContext,useState,useEffect } from "react";
function Sidebar() {
   const {user,setUser} = useContext(AuthContext);
     const userName=JSON.parse(localStorage.getItem("user")).name;
     const userId=JSON.parse(localStorage.getItem("user")).id;
  const navigate = useNavigate();
  const profilePic = () => {
    navigate(`/profile/${userId}`);
  };
 const [chatUsers, setChatUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const fetchChats = async () => {
      const res = await fetch(`http://localhost:3000/chats/${userId}`);
      const data = await res.json();
      setChatUsers(data.users);
    };
    fetchChats();
  }, [userId]);

   const BACKEND_URL = "http://localhost:3000"; 
 const searchUser = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length > 0) {
      try {
        const res = await fetch(`http://localhost:3000/search/${value}`, {
          method: "POST",
        });
        const data = await res.json();

        if (data.user) {
          // agar ek user mila toh array bana ke set karo
          setChatUsers([data.user]);
        } else {
          setChatUsers([]);
        }
      } catch (err) {
        console.error(err);
        setChatUsers([]);
      }
    } else {
      // agar search box empty hai toh original chats dikhao
      const res = await fetch(`http://localhost:3000/chats/${userId}`);
      const data = await res.json();
      setChatUsers(data.users);
    }
  };

  return (
    <div className="sidebar">
<div className="sidebar-top">
  <img 
    src={
      user && user.profilePicture 
        ? `${BACKEND_URL}${user.profilePicture}?t=${new Date().getTime()}` 
        : "https://via.placeholder.com/60" // Agar user ke paas image nahi hai, tabhi placeholder dikhega
    } 
    alt="Profile" 
    className="profile-pic" 
    onClick={profilePic} 
    style={{ objectFit: "cover", borderRadius: "50%" }} // Image gol aur properly fit hone ke liye
  />
  <h3 className="username">{userName || user?.name}</h3>
</div>

      {/* Search Box */}
      <div className="search-box">
        <input type="text" placeholder="Search User..."  onChange={searchUser}/>
      </div>

      {/* User List */}
      <div className="user-list">
         {chatUsers.length === 0 ? (
      <p>No chats yet</p>
    ) : (
      chatUsers.map(u =>(
        <div key={u._id} className="user-card">
          <img src={u.profilePicture} alt={u.name}/>
          <h4>{u.name}</h4>
        </div>
      ))
    )}
      </div>
    </div>
  );
}

export default Sidebar;
