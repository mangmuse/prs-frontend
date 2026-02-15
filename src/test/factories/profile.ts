import type { ProfileDetail, ProfileSummary } from "@/types/profile";

export const createMockProfileSummary = (overrides?: Partial<ProfileSummary>): ProfileSummary => ({
  id: 1,
  name: "기본 프로필",
  description: null,
  semanticThreshold: 0.85,
  constraintCount: 0,
  createdAt: "2026-01-01",
  ...overrides,
});

export const createMockProfileDetail = (overrides?: Partial<ProfileDetail>): ProfileDetail => ({
  id: 1,
  name: "기본 프로필",
  description: null,
  semanticThreshold: 0.85,
  globalConstraints: [],
  createdAt: "2026-01-01",
  updatedAt: null,
  ...overrides,
});
