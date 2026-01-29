import type {
  CreateProfileRequest,
  ProfileDetail,
  ProfileSummary,
  UpdateProfileRequest,
} from "@/types/profile";

import { apiClient } from "./client";

export const profilesApi = {
  getList: async (): Promise<ProfileSummary[]> => {
    return apiClient.get("evaluator-profiles").json<ProfileSummary[]>();
  },

  getDetail: async (id: number): Promise<ProfileDetail> => {
    return apiClient.get(`evaluator-profiles/${id}`).json<ProfileDetail>();
  },

  create: async (data: CreateProfileRequest): Promise<ProfileDetail> => {
    return apiClient.post("evaluator-profiles", { json: data }).json<ProfileDetail>();
  },

  update: async (id: number, data: UpdateProfileRequest): Promise<ProfileDetail> => {
    return apiClient.patch(`evaluator-profiles/${id}`, { json: data }).json<ProfileDetail>();
  },
};
