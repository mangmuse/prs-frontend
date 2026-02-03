import type { ModelsResponse } from "@/types/llm";

import { apiClient } from "./client";

export const llmApi = {
  async getModels(): Promise<ModelsResponse> {
    return apiClient.get("llm/models").json<ModelsResponse>();
  },
};
