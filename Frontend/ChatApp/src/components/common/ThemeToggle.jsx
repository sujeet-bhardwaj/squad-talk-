import React from "react";
import { Sun, Moon } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useAuthStore();

  return (
    <button
      onClick={toggleTheme}
      className="btn-icon"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle theme"
      style={{
        transition: "transform 0.3s ease",
      }}
    >
      {theme === "dark" ? (
        <Sun size={18} style={{ color: "#f59e0b" }} />
      ) : (
        <Moon size={18} style={{ color: "#6366f1" }} />
      )}
    </button>
  );
};

export default ThemeToggle;
