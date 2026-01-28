import ky from "ky";

const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
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
