export type RunStatus = "running" | "completed" | "failed";

export interface RunSummary {
  id: number;
  promptId: number;
  promptVersionId: number;
  promptName: string;
  versionNumber: number;
  datasetId: number;
  datasetName: string;
  profileId: number;
  profileName: string;
  status: RunStatus;
  passRate: number | null;
  avgSemantic: number | null;
  formatPassRate: number | null;
  semanticPassRate: number | null;
  constraintPassRate: number | null;
  totalRows: number;
  createdAt: string;
}

export interface CreateRunRequest {
  promptVersionId: number;
  datasetId: number;
  profileId: number;
}

export interface CreateRunResponse {
  id: number;
  status: string;
  createdAt: string;
}

export interface CreateRunFormState {
  promptId: number | null;
  versionId: number | null;
  datasetId: number | null;
  profileId: number | null;
}

export interface RelatedRun {
  id: number;
  versionNumber: number;
  status: RunStatus;
  passRate: number | null;
  createdAt: string;
}

export interface UnexecutedVersion {
  id: number;
  versionNumber: number;
}

export interface RelatedVersionsResponse {
  executedRuns: RelatedRun[];
  unexecutedVersions: UnexecutedVersion[];
}
