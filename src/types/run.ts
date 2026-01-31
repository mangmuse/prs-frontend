export type RunStatus = "running" | "completed" | "failed";

export interface RunSummary {
  id: number;
  prompt_version_id: number;
  prompt_name: string;
  version_number: number;
  dataset_id: number;
  dataset_name: string;
  profile_id: number;
  profile_name: string;
  status: RunStatus;
  pass_rate: number | null;
  avg_semantic: number | null;
  format_pass_rate: number | null;
  semantic_pass_rate: number | null;
  logic_pass_rate: number | null;
  total_rows: number;
  created_at: string;
}

export interface CreateRunRequest {
  prompt_version_id: number;
  dataset_id: number;
  profile_id: number;
}

export interface CreateRunResponse {
  id: number;
  status: string;
  created_at: string;
}

export interface CreateRunFormState {
  promptId: number | null;
  versionId: number | null;
  datasetId: number | null;
  profileId: number | null;
}
