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
  async getList(): Promise<Dataset[]> {
    return apiClient.get("datasets").json<Dataset[]>();
  },

  async create(data: CreateDatasetRequest): Promise<CreateDatasetResponse> {
    return apiClient.post("datasets", { json: data }).json<CreateDatasetResponse>();
  },

  async getDetail(id: number, page = 1, limit = 50): Promise<DatasetDetailResponse> {
    return apiClient
      .get(`datasets/${id}`, { searchParams: { page, limit } })
      .json<DatasetDetailResponse>();
  },

  async addRows(datasetId: number, rows: CreateRowsRequest[]): Promise<CreateRowsResponse> {
    return apiClient.post(`datasets/${datasetId}/rows`, { json: rows }).json<CreateRowsResponse>();
  },
};
