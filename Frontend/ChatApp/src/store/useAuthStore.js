import { create } from "zustand";
import axiosClient from "../api/axiosClient";

const getInitialUser = () => {
  try {
    const stored = localStorage.getItem("chat_app_user");
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

const getInitialTheme = () => {
  return localStorage.getItem("chat_app_theme") || "dark";
};

export const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  token: localStorage.getItem("chat_app_token") || null,
  isAuthenticated: !!localStorage.getItem("chat_app_token"),
  theme: getInitialTheme(),
  isLoading: false,
  error: null,

  setTheme: (theme) => {
    localStorage.setItem("chat_app_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosClient.post("/api/auth/login", { email, password });
      const { user, token } = response.data;

      localStorage.setItem("chat_app_token", token);
      localStorage.setItem("chat_app_user", JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to sign in. Please try again.";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  register: async (name, email, password, mobile) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosClient.post("/api/auth/register", {
        name,
        email,
        password,
        mobile,
      });
      const { user, token } = response.data;

      localStorage.setItem("chat_app_token", token);
      localStorage.setItem("chat_app_user", JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to register. Please try again.";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem("chat_app_token");
    localStorage.removeItem("chat_app_user");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateProfile: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosClient.put("/api/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.user;
      localStorage.setItem("chat_app_user", JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
      return { success: true, user: updatedUser };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update profile";
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },
}));
