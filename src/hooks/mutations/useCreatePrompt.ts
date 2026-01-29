import { useMutation, useQueryClient } from "@tanstack/react-query";

import { promptsApi } from "@/api/prompts";
import { promptQueries } from "@/queries/promptQueries";
import type { CreatePromptRequest } from "@/types/prompt";

export const useCreatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromptRequest) => promptsApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promptQueries.all() });
    },
  });
};
