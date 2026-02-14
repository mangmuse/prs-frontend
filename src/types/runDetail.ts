import type { LogicConstraint } from "./constraint";
import type { RunStatus } from "./run";

export interface AssembledPrompt {
  systemInstruction: string;
  userMessage: string;
}

export interface ConstraintResult {
  constraintType: string;
  target: string;
  passed: boolean;
  message: string | null;
}

export interface LogicLayerResult {
  passed: boolean;
  results: ConstraintResult[];
  errorMessage: string | null;
}

export interface RunResultRow {
  id: number;
  rowIndex: number;
  datasetRowId: number;
  inputSnapshot: Record<string, unknown>;
  expectedSnapshot: Record<string, unknown> | string | null;
  assembledPrompt: AssembledPrompt;
  status: "pass" | "format" | "semantic" | "constraint";
  isFormatPassed: boolean;
  semanticScore: number;
  logicResults: LogicLayerResult;
  rawOutput: string;
  parsedOutput: Record<string, unknown> | null;
}

export interface ProfileInRun {
  id: number;
  name: string;
  semanticThreshold: number;
  globalConstraints: LogicConstraint[];
}

export interface RunMetrics {
  passRate: number;
  avgSemantic: number;
  formatPassRate: number;
  semanticPassRate: number;
  constraintPassRate: number;
}

export interface RunDetailData {
  id: number;
  promptId: number;
  promptVersionId: number;
  datasetId: number;
  profileId: number;
  promptName: string;
  versionNumber: number;
  datasetName: string;
  status: RunStatus;
  createdAt: string;
  profile: ProfileInRun;
  metrics: RunMetrics;
  results: RunResultRow[];
}

export interface ReEvaluatedRow {
  id: number;
  status: "pass" | "format" | "semantic" | "constraint";
  logicResults: Record<string, unknown> | null;
}

export interface ReEvaluateResponse {
  results: ReEvaluatedRow[];
  passRate: number;
}

export type StatusFilter =
  | "all"
  | "pass"
  | "fail"
  | "regressed"
  | "improved"
  | "changed"
  | "unchanged";

export type MetricsAsPercent = {
  passRate: number;
  formatPassRate: number;
  semanticPassRate: number;
  constraintPassRate: number;
  avgSemantic: number;
};

export type MetricsDelta = {
  passRate: number;
  formatPassRate: number;
  semanticPassRate: number;
  constraintPassRate: number;
};
