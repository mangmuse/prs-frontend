import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isInitialized: boolean;

  setAccessToken: (token: string) => void;
  setGuest: () => void;
  clearAuth: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      isGuest: false,
      isInitialized: false,

      setAccessToken: (token) =>
        set({ accessToken: token, isAuthenticated: true, isGuest: false }, false, "setAccessToken"),

      setGuest: () =>
        set({ accessToken: null, isAuthenticated: false, isGuest: true }, false, "setGuest"),

      clearAuth: () =>
        set({ accessToken: null, isAuthenticated: false, isGuest: false }, false, "clearAuth"),

      setInitialized: () => set({ isInitialized: true }, false, "setInitialized"),
    }),
    { name: "auth-store" },
  ),
);
