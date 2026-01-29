import type { LogicConstraint, LogicConstraintInput } from "./common";

export interface Dataset {
  id: number;
  name: string;
  description?: string;
  row_count: number;
  created_at: string;
}

export interface DatasetRow {
  id: number;
  dataset_id: number;
  input_data: Record<string, unknown>;
  expected_output: string;
  row_constraints: LogicConstraint[];
  tags: string[];
}

// API Types
export interface CreateDatasetRequest {
  name: string;
  description?: string;
}

export interface CreateDatasetResponse {
  id: number;
  name: string;
  created_at: string;
}

export interface DatasetDetailResponse {
  id: number;
  name: string;
  rows: DatasetRow[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
  };
}

export interface CreateRowsRequest {
  input_data: Record<string, unknown>;
  expected_output: string;
  row_constraints: LogicConstraintInput[];
  tags: string[];
}

export interface CreateRowsResponse {
  created_count: number;
}
