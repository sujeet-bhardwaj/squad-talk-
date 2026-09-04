import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Check, User, Phone, MessageSquare, Sparkles } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "../components/common/Avatar";
import ThemeToggle from "../components/common/ThemeToggle";

const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Avery",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Leo",
];

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || "");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [successNotice, setSuccessNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setSelectedPreset(null);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePresetSelect = (presetUrl) => {
    setSelectedPreset(presetUrl);
    setAvatarFile(null);
    setPreviewUrl(presetUrl);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessNotice(false);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("mobile", mobile);
    formData.append("statusMessage", statusMessage);

    if (avatarFile) {
      formData.append("profilePicture", avatarFile);
    } else if (selectedPreset) {
      formData.append("profilePictureUrl", selectedPreset);
    }

    const res = await updateProfile(formData);
    if (res.success) {
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 3000);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "var(--bg-primary)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 20px",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => navigate("/chat")}
          className="btn-icon"
          title="Back to Chat"
          aria-label="Back to Chat"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)" }}>
          Profile Settings
        </h1>

        <ThemeToggle />
      </div>

      {/* Main Form Card */}
      <div
        className="glass-panel animate-pop-in"
        style={{
          width: "100%",
          maxWidth: "680px",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        {/* Success Alert */}
        {successNotice && (
          <div
            className="animate-pop-in"
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Check size={18} />
            <span>Profile successfully updated!</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            className="animate-pop-in"
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "0.9rem",
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Avatar Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div style={{ position: "relative" }}>
            <Avatar
              src={previewUrl || user?.profilePicture}
              name={name || user?.name}
              size="xl"
              showStatus={true}
              isOnline={true}
            />

            <label
              htmlFor="avatar-upload"
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "var(--shadow-md)",
                border: "2px solid var(--bg-secondary)",
              }}
              title="Upload Photo"
            >
              <Camera size={18} />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{user?.email}</p>
          </div>

          {/* Avatar Presets */}
          <div style={{ textAlign: "center", marginTop: "6px" }}>
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: "600",
                color: "var(--text-muted)",
                marginBottom: "8px",
              }}
            >
              Or pick an instant avatar:
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              {AVATAR_PRESETS.map((preset, idx) => (
                <img
                  key={idx}
                  src={preset}
                  alt="Preset"
                  onClick={() => handlePresetSelect(preset)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    border:
                      selectedPreset === preset
                        ? "3px solid var(--accent-primary)"
                        : "2px solid var(--border-color)",
                    padding: "2px",
                    background: "var(--bg-tertiary)",
                    transition: "var(--transition-smooth)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Input Details */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              Display Name
            </label>
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
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                style={{ paddingLeft: "42px" }}
                required
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              Phone / Mobile
            </label>
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
                className="input-field"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. +1 555 0192"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              About / Status Bio
            </label>
            <div style={{ position: "relative" }}>
              <MessageSquare
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "16px",
                  color: "var(--text-muted)",
                }}
              />
              <textarea
                className="input-field"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="Tell others what you're up to..."
                rows={3}
                style={{
                  paddingLeft: "42px",
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => navigate("/chat")}
              style={{
                padding: "10px 20px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ padding: "10px 28px" }}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
