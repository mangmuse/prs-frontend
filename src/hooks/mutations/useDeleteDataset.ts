import { useMutation, useQueryClient } from "@tanstack/react-query";

import { datasetsApi } from "@/api/datasets";
import { datasetQueries } from "@/queries/datasetQueries";

export const useDeleteDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datasetId: number) => datasetsApi.delete(datasetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: datasetQueries.all() });
    },
  });
};
