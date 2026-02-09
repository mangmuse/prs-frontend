import type { LLMProvider } from "@/stores/apiKeyStore";
import type { ModelsResponse, VerifyKeyResponse } from "@/types/llm";

import { apiClient } from "./client";

export const llmApi = {
  async getModels(): Promise<ModelsResponse> {
    return apiClient.get("llm/models").json<ModelsResponse>();
  },

  async verifyKey(provider: LLMProvider, apiKey: string): Promise<VerifyKeyResponse> {
    return apiClient
      .post("llm/verify-key", { json: { provider, apiKey } })
      .json<VerifyKeyResponse>();
  },
};
