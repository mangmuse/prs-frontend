import type { RunSummary } from "@/types/run";

export const createMockRunSummary = (overrides?: Partial<RunSummary>): RunSummary => ({
  id: 1,
  promptId: 1,
  promptVersionId: 1,
  promptName: "테스트 프롬프트",
  versionNumber: 1,
  datasetId: 1,
  datasetName: "테스트 데이터셋",
  profileId: 1,
  profileName: "기본 프로필",
  status: "completed",
  passRate: 0.85,
  avgSemantic: 0.9,
  formatPassRate: 1.0,
  semanticPassRate: 0.9,
  constraintPassRate: 0.85,
  totalRows: 10,
  createdAt: "2026-01-01",
  ...overrides,
});
