import type {
  CreateDatasetRequest,
  CreateDatasetResponse,
  CreateRowsRequest,
  CreateRowsResponse,
  Dataset,
  DatasetDetailResponse,
} from "@/types/dataset";

import { apiClient } from "./client";

export const datasetsApi = {
  getList: async (): Promise<Dataset[]> => {
    return apiClient.get("datasets").json<Dataset[]>();
  },

  create: async (data: CreateDatasetRequest): Promise<CreateDatasetResponse> => {
    return apiClient.post("datasets", { json: data }).json<CreateDatasetResponse>();
  },

  getDetail: async (id: number, page = 1, limit = 50): Promise<DatasetDetailResponse> => {
    return apiClient
      .get(`datasets/${id}`, { searchParams: { page, limit } })
      .json<DatasetDetailResponse>();
  },

  addRows: async (datasetId: number, rows: CreateRowsRequest[]): Promise<CreateRowsResponse> => {
    return apiClient.post(`datasets/${datasetId}/rows`, { json: rows }).json<CreateRowsResponse>();
  },
};
