// import "./Profile.css"; 
// import React, { useState, useEffect } from "react";
// import { AuthContext } from "../App";
// import { useContext } from "react";
// import { useNavigate } from "react-router";
// export const Profile = () => {
//     const {user,setUser} = useContext(AuthContext);
//   const userId=JSON.parse(localStorage.getItem("user")).id;
//    const navigate = useNavigate();
//   const [profileFormData, setProfileForm] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     profilePicture:""
//   });
//     useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await fetch(`http://localhost:3000/profile/${userId}`);
//         const data = await res.json();
//         setProfileForm({
//           name: data.name,
//           email: data.email,
//           mobile: data.mobile,
//           profilePicture: data.profilePicture
//         });
//       } catch (err) {
//         console.error("Error fetching profile:", err);
//       }
//     };
//     fetchProfile();
//   }, []);

// const handleSave = async () => {
//   try {
//     const formData = new FormData();
//     formData.append("name", profileFormData.name);
//     formData.append("email", profileFormData.email);
//     formData.append("mobile", profileFormData.mobile);

//     if (profileFormData.profilePicture instanceof File) {
//       formData.append("profilePicture", profileFormData.profilePicture);
//     }

//     const res = await fetch(`http://localhost:3000/profile/${userId}/save`, {
//       method: "POST",
//       body: formData,
//     });

//     if (!res.ok) throw new Error(`Server error: ${res.status}`);
//     const result = await res.json();
//     console.log("Profile updated:", result);

//     if (result.user) {
//       localStorage.setItem("user", JSON.stringify(result.user));
//       setUser(result.user);
//       navigate("/dashboard");
//     }
//   } catch (err) {
//     console.error("Error saving profile:", err);
//   }
// };


//   const handleChange = (e) => {
//     setProfileForm({ ...profileFormData, [e.target.name]: e.target.value });
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <h2>Profile</h2>
//         <input
//           type="text"
//           name="name"
//           placeholder="Name"
//           value={profileFormData.name}
//           onChange={handleChange}
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={profileFormData.email}
//           onChange={handleChange}
//         />
//         <input
//           type="number"
//           name="mobile"
//           placeholder="Mobile Number"
//           value={profileFormData.mobile}
//           onChange={handleChange}
//         />
// <input 
//   type="file" 
//   name="profilePicture" 
//   accept="image/*" 
//   onChange={(e) => {
//     const file = e.target.files[0];
//     setProfileForm({
//       ...profileFormData,
//       profilePicture: file
//     });
//   }}
// />

// {profileFormData.profilePicture && (
//  <img
// src={
// profileFormData.profilePicture instanceof File
// ? URL.createObjectURL(profileFormData.profilePicture)
// : `http://localhost:3000${profileFormData.profilePicture}`
// }
// width="100"
// />
// )}

//         <div className="modal-buttons">
//           <button onClick={handleSave}>Save</button>
//         </div>
//       </div>
//     </div>
//   );
// };


import "./Profile.css"; 
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { useNavigate } from "react-router";

export const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Safely grab the userId, providing a fallback if storage is empty
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null;

  const [profileFormData, setProfileForm] = useState({
    name: "",
    email: "",
    mobile: "",
    profilePicture: ""
  });

  // Base URL configuration for your images
  const BACKEND_URL = "http://localhost:3000";

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/profile/${userId}`);
        const data = await res.json();
        
        setProfileForm({
          name: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          // Normalize whatever your get-profile route outputs
          profilePicture: data.profilePicture || "" 
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [userId]); // Fixed: Included userId in dependency array

  const handleSave = async () => {
    try {
      if (!userId) return alert("User ID missing!");

      const formData = new FormData();
      formData.append("name", profileFormData.name);
      formData.append("email", profileFormData.email);
      formData.append("mobile", profileFormData.mobile);

      if (profileFormData.profilePicture instanceof File) {
        formData.append("profilePicture", profileFormData.profilePicture);
      }

      const res = await fetch(`${BACKEND_URL}/profile/${userId}/save`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result = await res.json();
      console.log("Profile updated successfully:", result);

      if (result.user) {
        // 1. Sync local storage
        localStorage.setItem("user", JSON.stringify(result.user));
        
        // 2. Sync global application Context state
        setUser(result.user);
        
        // 3. Update the local component form state immediately 
        setProfileForm({
          name: result.user.name,
          email: result.user.email,
          mobile: result.user.mobile,
          profilePicture: result.user.profilePicture
        });

        // 4. Redirect
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
            if (file) {
              setProfileForm({
                ...profileFormData,
                profilePicture: file
              });
            }
          }}
        />

        {profileFormData.profilePicture && (
          <div className="image-preview-container" style={{ margin: "15px 0" }}>
            <img
              src={
                profileFormData.profilePicture instanceof File
                  ? URL.createObjectURL(profileFormData.profilePicture)
                  : `${BACKEND_URL}${profileFormData.profilePicture}`
              }
              alt="Profile Preview"
              width="100"
              height="100"
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
        )}

        <div className="modal-buttons">
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};