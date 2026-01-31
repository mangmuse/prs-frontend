import { useMutation, useQueryClient } from "@tanstack/react-query";

import { runsApi } from "@/api/runs";
import { runQueries } from "@/queries/runQueries";
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
