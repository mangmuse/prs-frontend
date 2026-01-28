import { apiClient } from "./client";

export interface GuestSession {
  guest_id: string;
  created_at: string;
}

export const authApi = {
  createGuestSession: async (): Promise<GuestSession> => {
    return apiClient.post("auth/guest").json<GuestSession>();
  },
};
