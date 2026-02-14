import { useMutation, useQueryClient } from "@tanstack/react-query";

import { promptsApi } from "@/api/prompts";
import { promptQueries } from "@/queries/promptQueries";
import type { UpdatePromptRequest } from "@/types/prompt";

export const useUpdatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ promptId, data }: { promptId: number; data: UpdatePromptRequest }) =>
      promptsApi.update(promptId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promptQueries.all() });
    },
  });
};
