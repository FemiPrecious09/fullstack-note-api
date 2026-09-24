// src/store/authStore.ts

import { create } from "zustand";
import { loginUser, registerUser, logoutUser, getCurrentUser } from "@/services/api/auth";
import { getProfile, saveProfile } from "@/services/api/profile";
import { ApiError } from "@/services/fetcher";
import type { User, Profile } from "@/services/types";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  /** Call once on app mount (e.g. in the dashboard layout) to hydrate session state. */
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginUser({ username, password });
      set({ user });
      await get().fetchProfile();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed. Please try again.";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await registerUser({ username, password });
      set({ user });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Registration failed. Please try again.";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await logoutUser();
    } finally {
      set({ user: null, profile: null });
    }
  },

  fetchProfile: async () => {
    // getProfile() already normalizes 404 -> null, so no try/catch needed here.
    const profile = await getProfile();
    set({ profile });
  },

  updateProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const saved = await saveProfile(profile);
      set({ profile: saved });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not save profile. Please try again.";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Since auth is httpOnly-cookie based, there's no client-readable token to check.
  // We infer session state by attempting to fetch the profile with skipAuthRedirect
  // so a logged-out visit to "/" doesn't get bounced to /login.
  checkAuth: async () => {
  try {
    const user = await getCurrentUser();
    const profile = await getProfile();
    set({ user, profile, isInitialized: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      set({ user: null, profile: null, isInitialized: true });
    } else {
      set({ isInitialized: true });
    }
  }
},

  clearError: () => set({ error: null }),
}));