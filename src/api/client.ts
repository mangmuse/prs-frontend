import ky from "ky";

import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 10000,
  credentials: "include", // Cookie 자동 전송
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
      (_request, _options, response) => {
        if (!response.ok) {
          console.error("API Error:", response.status, response.statusText);
        }
        return response;
      },
    ],
  },
});
