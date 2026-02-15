import type { Dataset, DatasetDetailResponse, DatasetRow } from "@/types/dataset";

export const createMockDataset = (overrides?: Partial<Dataset>): Dataset => ({
  id: 1,
  name: "테스트 데이터셋",
  description: "",
  rowCount: 10,
  createdAt: "2026-01-01",
  ...overrides,
});

export const createMockDatasetRow = (overrides?: Partial<DatasetRow>): DatasetRow => ({
  id: 1,
  datasetId: 1,
  inputData: { question: "질문1" },
  expectedOutput: "답변1",
  tags: [],
  ...overrides,
});

export const createMockDatasetDetail = (
  overrides?: Partial<DatasetDetailResponse>,
): DatasetDetailResponse => ({
  id: 1,
  name: "테스트 데이터셋",
  description: "",
  rows: [createMockDatasetRow()],
  pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 },
  ...overrides,
});
