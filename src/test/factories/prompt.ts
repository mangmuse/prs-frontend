import type { PromptSummary, VersionDetail, VersionSummary } from "@/types/prompt";

export const createMockPrompt = (overrides?: Partial<PromptSummary>): PromptSummary => ({
  id: 1,
  name: "테스트 프롬프트",
  description: null,
  latestVersion: 1,
  versionCount: 1,
  createdAt: "2026-01-01",
  ...overrides,
});

export const createMockVersion = (overrides?: Partial<VersionSummary>): VersionSummary => ({
  id: 1,
  versionNumber: 1,
  model: "gpt-4o",
  memo: null,
  userTemplate: "{{input}}",
  createdAt: "2026-01-01",
  ...overrides,
});

export const createMockVersionDetail = (overrides?: Partial<VersionDetail>): VersionDetail => ({
  id: 1,
  promptId: 1,
  versionNumber: 1,
  systemInstruction: "시스템 지시",
  userTemplate: "{{input}}",
  model: "gpt-4o",
  temperature: 0.7,
  outputSchema: "Freeform",
  memo: null,
  createdAt: "2026-01-01",
  ...overrides,
});
