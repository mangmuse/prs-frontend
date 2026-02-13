import { apiClient } from "./client";

export interface GuestSessionResponse {
  guestId: string;
  createdAt: string;
}

export interface TokenResponse {
  accessToken: string;
  wasGuest: boolean;
}

export interface UserInfo {
  id: number;
  email: string;
  name: string | null;
  pictureUrl: string | null;
}

export interface MigrateResponse {
  datasets: number;
  prompts: number;
  profiles: number;
  runs: number;
}

export const authApi = {
  async createGuestSession(): Promise<GuestSessionResponse> {
    return apiClient.post("auth/guest").json<GuestSessionResponse>();
  },

  async exchangeToken(code: string): Promise<TokenResponse> {
    return apiClient.post("auth/token", { json: { code } }).json<TokenResponse>();
  },

  async refreshToken(): Promise<TokenResponse> {
    return apiClient.post("auth/refresh").json<TokenResponse>();
  },

  async getMe(): Promise<UserInfo> {
    return apiClient.get("auth/me").json<UserInfo>();
  },

  async migrate(): Promise<MigrateResponse> {
    return apiClient.post("auth/migrate").json<MigrateResponse>();
  },

  async logout(): Promise<void> {
    await apiClient.post("auth/logout");
  },
};
