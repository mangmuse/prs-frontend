import { useMutation, useQueryClient } from "@tanstack/react-query";

import { runsApi } from "@/api/runs";
import { runQueries } from "@/queries/runQueries";
import type { LogicConstraint } from "@/types/constraint";
import type { CreateRunRequest } from "@/types/run";

export const useCreateRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRunRequest) => runsApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: runQueries.all() });
    },
  });
};

export const useUpdateRunProfileSnapshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      runId,
      data,
    }: {
      runId: number;
      data: { semanticThreshold: number; globalConstraints: LogicConstraint[] };
    }) => runsApi.updateProfileSnapshot(runId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...runQueries.all(), "detailInfinite", variables.runId],
      });
    },
  });
};

export const useDeleteRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: number) => runsApi.delete(runId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: runQueries.all() });
    },
  });
};
