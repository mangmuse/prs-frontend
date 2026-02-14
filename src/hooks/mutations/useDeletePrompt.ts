import { useMutation, useQueryClient } from "@tanstack/react-query";

import { promptsApi } from "@/api/prompts";
import { promptQueries } from "@/queries/promptQueries";

export const useDeletePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promptId: number) => promptsApi.delete(promptId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promptQueries.all() });
    },
  });
};
