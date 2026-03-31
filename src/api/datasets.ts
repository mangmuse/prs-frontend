import type {
  CreateDatasetRequest,
  CreateDatasetResponse,
  CreateRowsRequest,
  CreateRowsResponse,
  CsvImportResponse,
  Dataset,
  DatasetDetailResponse,
  DatasetRow,
  UpdateDatasetRequest,
  UpdateRowRequest,
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

  async updateRow(datasetId: number, rowId: number, data: UpdateRowRequest): Promise<DatasetRow> {
    return apiClient.put(`datasets/${datasetId}/rows/${rowId}`, { json: data }).json<DatasetRow>();
  },

  async deleteRow(datasetId: number, rowId: number): Promise<void> {
    await apiClient.delete(`datasets/${datasetId}/rows/${rowId}`);
  },

  async update(datasetId: number, data: UpdateDatasetRequest): Promise<Dataset> {
    return apiClient.patch(`datasets/${datasetId}`, { json: data }).json<Dataset>();
  },

  async delete(datasetId: number): Promise<void> {
    await apiClient.delete(`datasets/${datasetId}`);
  },

  async importCsv(datasetId: number, file: File): Promise<CsvImportResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post(`datasets/${datasetId}/import-csv`, { body: formData })
      .json<CsvImportResponse>();
  },
};
