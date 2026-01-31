import type {
  CreatePromptRequest,
  CreatePromptResponse,
  CreateVersionRequest,
  PromptSummary,
  VersionDetail,
  VersionSummary,
} from "@/types/prompt";

import { apiClient } from "./client";

export const promptsApi = {
  async getList(): Promise<PromptSummary[]> {
    return apiClient.get("prompts").json<PromptSummary[]>();
  },

  async create(data: CreatePromptRequest): Promise<CreatePromptResponse> {
    return apiClient.post("prompts", { json: data }).json<CreatePromptResponse>();
  },

  async getVersions(promptId: number): Promise<VersionSummary[]> {
    return apiClient.get(`prompts/${promptId}/versions`).json<VersionSummary[]>();
  },

  async getVersionDetail(promptId: number, versionId: number): Promise<VersionDetail> {
    return apiClient.get(`prompts/${promptId}/versions/${versionId}`).json<VersionDetail>();
  },

  async createVersion(promptId: number, data: CreateVersionRequest): Promise<VersionDetail> {
    return apiClient.post(`prompts/${promptId}/versions`, { json: data }).json<VersionDetail>();
  },
};
