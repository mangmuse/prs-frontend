import { useMutation, useQueryClient } from "@tanstack/react-query";

import { datasetsApi } from "@/api/datasets";
import { datasetQueries } from "@/queries/datasetQueries";
import type { UpdateRowRequest } from "@/types/dataset";

export const useUpdateDatasetRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      datasetId,
      rowId,
      data,
    }: {
      datasetId: number;
      rowId: number;
      data: UpdateRowRequest;
    }) => datasetsApi.updateRow(datasetId, rowId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: datasetQueries.all() });
    },
  });
};
