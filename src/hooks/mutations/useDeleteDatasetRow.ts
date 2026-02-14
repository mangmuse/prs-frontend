import { useMutation, useQueryClient } from "@tanstack/react-query";

import { datasetsApi } from "@/api/datasets";
import { datasetQueries } from "@/queries/datasetQueries";

export const useDeleteDatasetRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ datasetId, rowId }: { datasetId: number; rowId: number }) =>
      datasetsApi.deleteRow(datasetId, rowId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: datasetQueries.all() });
    },
  });
};
