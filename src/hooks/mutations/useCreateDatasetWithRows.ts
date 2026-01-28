import { useMutation, useQueryClient } from "@tanstack/react-query";

import { datasetsApi } from "@/api/datasets";
import { datasetQueries } from "@/queries/datasetQueries";
import type { CreateDatasetRequest, CreateRowsRequest } from "@/types/dataset";

interface CreateDatasetWithRowsInput {
  dataset: CreateDatasetRequest;
  rows: CreateRowsRequest[];
}

export const useCreateDatasetWithRows = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dataset, rows }: CreateDatasetWithRowsInput) => {
      const created = await datasetsApi.create(dataset);

      if (rows.length > 0) {
        await datasetsApi.addRows(created.id, rows);
      }

      return created;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: datasetQueries.all() });
    },
  });
};
