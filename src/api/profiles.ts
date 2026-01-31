import type {
  CreateProfileRequest,
  ProfileDetail,
  ProfileSummary,
  UpdateProfileRequest,
} from "@/types/profile";

import { apiClient } from "./client";

export const profilesApi = {
  async getList(): Promise<ProfileSummary[]> {
    return apiClient.get("evaluator-profiles").json<ProfileSummary[]>();
  },

  async getDetail(id: number): Promise<ProfileDetail> {
    return apiClient.get(`evaluator-profiles/${id}`).json<ProfileDetail>();
  },

  async create(data: CreateProfileRequest): Promise<ProfileDetail> {
    return apiClient.post("evaluator-profiles", { json: data }).json<ProfileDetail>();
  },

  async update(id: number, data: UpdateProfileRequest): Promise<ProfileDetail> {
    return apiClient.patch(`evaluator-profiles/${id}`, { json: data }).json<ProfileDetail>();
  },
};
