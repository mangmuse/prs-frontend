import { useMutation, useQueryClient } from "@tanstack/react-query";

import { datasetsApi } from "@/api/datasets";
import { datasetQueries } from "@/queries/datasetQueries";
import type { CreateDatasetRequest } from "@/types/dataset";

export const useCreateDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDatasetRequest) => datasetsApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: datasetQueries.all() });
    },
  });
};
