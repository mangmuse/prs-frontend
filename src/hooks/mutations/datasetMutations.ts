import { useMutation, useQueryClient } from "@tanstack/react-query";

import { datasetsApi } from "@/api/datasets";
import { datasetQueries } from "@/queries/datasetQueries";
import type {
  CreateDatasetRequest,
  CreateRowsRequest,
  UpdateDatasetRequest,
  UpdateRowRequest,
} from "@/types/dataset";

export const useCreateDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDatasetRequest) => datasetsApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: datasetQueries.all() });
    },
  });
};

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

export const useUpdateDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ datasetId, data }: { datasetId: number; data: UpdateDatasetRequest }) =>
      datasetsApi.update(datasetId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: datasetQueries.all() });
    },
  });
};

export const useDeleteDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datasetId: number) => datasetsApi.delete(datasetId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: datasetQueries.all() });
    },
  });
};
