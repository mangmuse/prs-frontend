import { apiClient } from "./client";

export interface GuestSessionResponse {
  guest_id: string;
  token: string;
  expires_at: string;
}

export const authApi = {
  createGuestSession: async (): Promise<GuestSessionResponse> => {
    return apiClient.post("auth/guest").json<GuestSessionResponse>();
  },
};
