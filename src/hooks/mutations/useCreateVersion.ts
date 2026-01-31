import { useMutation, useQueryClient } from "@tanstack/react-query";

import { promptsApi } from "@/api/prompts";
import { promptQueries } from "@/queries/promptQueries";
import { runQueries } from "@/queries/runQueries";
import type { CreateVersionRequest } from "@/types/prompt";

export const useCreateVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ promptId, data }: { promptId: number; data: CreateVersionRequest }) =>
      promptsApi.createVersion(promptId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promptQueries.all() });
      void queryClient.invalidateQueries({ queryKey: runQueries.all() });
    },
  });
};
