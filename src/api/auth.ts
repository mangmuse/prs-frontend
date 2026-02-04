import { apiClient } from "./client";

export interface GuestSessionResponse {
  guestId: string;
  createdAt: string;
}

export const authApi = {
  async createGuestSession(): Promise<GuestSessionResponse> {
    return apiClient.post("auth/guest").json<GuestSessionResponse>();
  },
};
