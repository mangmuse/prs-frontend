import ky, { type KyRequest } from "ky";

import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

let refreshPromise: Promise<string | null> | null = null;

const attemptTokenRefresh = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = ky
    .post("auth/refresh", {
      prefixUrl: API_BASE_URL,
      credentials: "include",
    })
    .json<{ accessToken: string }>()
    .then((data) => {
      useAuthStore.getState().setAccessToken(data.accessToken);
      return data.accessToken;
    })
    .catch(() => {
      useAuthStore.getState().setGuest();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

const retryWithNewToken = async (request: KyRequest, newToken: string): Promise<Response> => {
  request.headers.set("Authorization", `Bearer ${newToken}`);
  return fetch(request);
};

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 10000,
  retry: import.meta.env.MODE === "test" ? { limit: 0 } : undefined,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status !== 401) return response;

        const { isGuest } = useAuthStore.getState();
        if (isGuest) return response;

        if (request.url.includes("/auth/refresh")) return response;

        const newToken = await attemptTokenRefresh();
        if (!newToken) return response;

        return retryWithNewToken(request, newToken);
      },
    ],
  },
});
