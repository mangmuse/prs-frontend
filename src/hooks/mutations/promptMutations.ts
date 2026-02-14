import { useMutation, useQueryClient } from "@tanstack/react-query";

import { promptsApi } from "@/api/prompts";
import { promptQueries } from "@/queries/promptQueries";
import { runQueries } from "@/queries/runQueries";
import type {
  CreatePromptRequest,
  CreateVersionRequest,
  UpdatePromptRequest,
} from "@/types/prompt";

export const useCreatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromptRequest) => promptsApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promptQueries.all() });
    },
  });
};

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

export const useDeletePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promptId: number) => promptsApi.delete(promptId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promptQueries.all() });
    },
  });
};

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
