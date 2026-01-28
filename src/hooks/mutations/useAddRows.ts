import { useMutation, useQueryClient } from "@tanstack/react-query";

import { datasetsApi } from "@/api/datasets";
import { datasetQueries } from "@/queries/datasetQueries";
import type { CreateRowsRequest } from "@/types/dataset";

interface AddRowsParams {
  datasetId: number;
  rows: CreateRowsRequest[];
}

export const useAddRows = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ datasetId, rows }: AddRowsParams) => datasetsApi.addRows(datasetId, rows),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: datasetQueries.all() });
    },
  });
};
