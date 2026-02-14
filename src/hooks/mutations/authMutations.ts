import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/api/auth";
import { llmApi } from "@/api/llm";
import type { LLMProvider } from "@/stores/apiKeyStore";

export const useMigrate = () => {
  return useMutation({
    mutationFn: () => authApi.migrate(),
  });
};

export const useVerifyApiKey = () => {
  return useMutation({
    mutationFn: ({ provider, apiKey }: { provider: LLMProvider; apiKey: string }) =>
      llmApi.verifyKey(provider, apiKey),
  });
};
