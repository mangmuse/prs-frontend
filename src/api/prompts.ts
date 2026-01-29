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
  getList: async (): Promise<PromptSummary[]> => {
    return apiClient.get("prompts").json<PromptSummary[]>();
  },

  create: async (data: CreatePromptRequest): Promise<CreatePromptResponse> => {
    return apiClient.post("prompts", { json: data }).json<CreatePromptResponse>();
  },

  getVersions: async (promptId: number): Promise<VersionSummary[]> => {
    return apiClient.get(`prompts/${promptId}/versions`).json<VersionSummary[]>();
  },

  getVersionDetail: async (promptId: number, versionId: number): Promise<VersionDetail> => {
    return apiClient.get(`prompts/${promptId}/versions/${versionId}`).json<VersionDetail>();
  },

  createVersion: async (promptId: number, data: CreateVersionRequest): Promise<VersionDetail> => {
    return apiClient.post(`prompts/${promptId}/versions`, { json: data }).json<VersionDetail>();
  },
};
