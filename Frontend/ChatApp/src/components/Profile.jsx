import "./Profile.css"; 
import React, { useState, useEffect } from "react";
import { AuthContext } from "../App";
import { useContext } from "react";
import { useNavigate } from "react-router";
export const Profile = () => {
    const {user,setUser} = useContext(AuthContext);
  const userId=JSON.parse(localStorage.getItem("user")).id;
   const navigate = useNavigate();
  const [profileFormData, setProfileForm] = useState({
    name: "",
    email: "",
    mobile: "",
    profilePicture:""
  });
    useEffect(() => {
    const fetchProfile = async () => {
      try {
          const res = await fetch(`http://localhost:3000/profile/${userId}`);
        const data = await res.json();
        setProfileForm({
          name: data.name,
          email: data.email,
          mobile: data.mobile,
          profilePicture: data.profilePicture
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

const handleSave = async () => {
  try {
    const formData = new FormData();
    formData.append("name", profileFormData.name);
    formData.append("email", profileFormData.email);
    formData.append("mobile", profileFormData.mobile);

    if (profileFormData.profilePicture instanceof File) {
      formData.append("profilePicture", profileFormData.profilePicture);
    }

    const res = await fetch(`http://localhost:3000/profile/${userId}/save`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const result = await res.json();
    console.log("Profile updated:", result);

    if (result.user) {
      localStorage.setItem("user", JSON.stringify(result.user));
      setUser(result.user);
      navigate("/dashboard");
    }
  } catch (err) {
    console.error("Error saving profile:", err);
  }
};


  const handleChange = (e) => {
    setProfileForm({ ...profileFormData, [e.target.name]: e.target.value });
  };




  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Profile</h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={profileFormData.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={profileFormData.email}
          onChange={handleChange}
        />
        <input
          type="number"
          name="mobile"
          placeholder="Mobile Number"
          value={profileFormData.mobile}
          onChange={handleChange}
        />
<input 
  type="file" 
  name="profilePicture" 
  accept="image/*" 
  onChange={(e) => {
    const file = e.target.files[0];
    setProfileForm({
      ...profileFormData,
      profilePicture: file
    });
  }}
/>

{profileFormData.profilePicture && (
 <img
src={
profileFormData.profilePicture instanceof File
? URL.createObjectURL(profileFormData.profilePicture)
: `http://localhost:3000${profileFormData.profilePicture}`
}
width="100"
/>
)}

        <div className="modal-buttons">
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};
