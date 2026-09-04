import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import ThemeToggle from "../components/common/ThemeToggle";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoading, error } = useAuthStore();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (isLoginTab) {
      if (!formData.email || !formData.password) {
        setFormError("Please provide both email and password.");
        return;
      }
      const res = await login(formData.email, formData.password);
      if (res.success) {
        navigate("/chat");
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setFormError("Please fill out all required fields.");
        return;
      }
      if (formData.password.length < 6) {
        setFormError("Password must be at least 6 characters long.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }

      const res = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.mobile
      );
      if (res.success) {
        navigate("/chat");
      }
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "var(--bg-primary)",
        position: "relative",
      }}
    >
      {/* Top Bar Theme Toggle */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          zIndex: 20,
        }}
      >
        <ThemeToggle />
      </div>

      {/* Main Glass Card */}
      <div
        className="glass-panel animate-pop-in"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* App Branding */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "18px",
              background: "var(--accent-gradient)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "var(--shadow-glow)",
              marginBottom: "12px",
            }}
          >
            <MessageSquare size={28} />
          </div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: "800",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Squad Talk
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Real-time messaging platform powered by Socket.io
          </p>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            padding: "4px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--bg-input)",
            border: "1px solid var(--border-color)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setFormError("");
            }}
            style={{
              padding: "10px",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
              backgroundColor: isLoginTab ? "var(--accent-primary)" : "transparent",
              color: isLoginTab ? "#ffffff" : "var(--text-secondary)",
              boxShadow: isLoginTab ? "var(--shadow-sm)" : "none",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setFormError("");
            }}
            style={{
              padding: "10px",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
              backgroundColor: !isLoginTab ? "var(--accent-primary)" : "transparent",
              color: !isLoginTab ? "#ffffff" : "var(--text-secondary)",
              boxShadow: !isLoginTab ? "var(--shadow-sm)" : "none",
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {(formError || error) && (
          <div
            className="animate-pop-in"
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{formError || error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {!isLoginTab && (
            <div style={{ position: "relative" }}>
              <User
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          )}

          <div style={{ position: "relative" }}>
            <Mail
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              style={{ paddingLeft: "42px" }}
              required
            />
          </div>

          {!isLoginTab && (
            <div style={{ position: "relative" }}>
              <Phone
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                name="mobile"
                className="input-field"
                placeholder="Mobile Number (optional)"
                value={formData.mobile}
                onChange={handleChange}
                style={{ paddingLeft: "42px" }}
              />
            </div>
          )}

          <div style={{ position: "relative" }}>
            <Lock
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="input-field"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              style={{ paddingLeft: "42px", paddingRight: "42px" }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {!isLoginTab && (
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                className="input-field"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: "100%", padding: "14px", marginTop: "8px" }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isLoginTab ? "Sign In" : "Get Started"}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
