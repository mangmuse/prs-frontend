import { useMutation } from "@tanstack/react-query";

import { llmApi } from "@/api/llm";
import type { LLMProvider } from "@/stores/apiKeyStore";

export const useVerifyApiKey = () => {
  return useMutation({
    mutationFn: ({ provider, apiKey }: { provider: LLMProvider; apiKey: string }) =>
      llmApi.verifyKey(provider, apiKey),
  });
};
