export interface Dataset {
  id: number;
  name: string;
  description?: string;
  rowCount: number;
  createdAt: string;
}

export interface DatasetRow {
  id: number;
  datasetId: number;
  inputData: Record<string, unknown>;
  expectedOutput: string;
  tags: string[];
}

export interface CreateDatasetRequest {
  name: string;
  description?: string;
}

export interface CreateDatasetResponse {
  id: number;
  name: string;
  createdAt: string;
}

export interface DatasetDetailResponse {
  id: number;
  name: string;
  description?: string;
  rows: DatasetRow[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface CreateRowsRequest {
  inputData: Record<string, unknown>;
  expectedOutput: string;
  tags: string[];
}

export interface CreateRowsResponse {
  createdCount: number;
}

export interface UpdateDatasetRequest {
  name: string;
  description: string;
}

export interface UpdateRowRequest {
  inputData: Record<string, unknown>;
  expectedOutput: string;
  tags?: string[];
}

export interface CsvImportResponse {
  createdCount: number;
}
