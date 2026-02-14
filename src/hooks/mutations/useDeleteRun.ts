import { useMutation, useQueryClient } from "@tanstack/react-query";

import { runsApi } from "@/api/runs";
import { runQueries } from "@/queries/runQueries";

export const useDeleteRun = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: number) => runsApi.delete(runId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: runQueries.all() });
    },
  });
};
