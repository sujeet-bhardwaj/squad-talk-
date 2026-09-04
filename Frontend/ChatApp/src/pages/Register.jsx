import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import styles from "./Register.module.css";  
import { AuthContext } from "../App";
function Register() {
  const {user,setUser} = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name:"",
    email: "",
    password: "",
    confirmPassword:""
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    return alert("Password not matched");
  }
  try {
    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    console.log("Backend Response:",data);
    if (response.ok) {
      localStorage.setItem("token", data.token); 
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      alert("Registration successful!");
      navigate("/login");
    } else {
      alert(data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Server error");
  }
};

  return (
    <div className={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already registered? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
