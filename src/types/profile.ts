import type { LogicConstraint } from "./constraint";

export interface ProfileSummary {
  id: number;
  name: string;
  description: string | null;
  semanticThreshold: number;
  constraintCount: number;
  createdAt: string;
}

export interface ProfileDetail {
  id: number;
  name: string;
  description: string | null;
  semanticThreshold: number;
  globalConstraints: LogicConstraint[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateProfileRequest {
  name: string;
  description?: string;
  semanticThreshold: number;
  globalConstraints: LogicConstraint[];
}

export interface UpdateProfileRequest {
  name?: string;
  description?: string;
  semanticThreshold?: number;
  globalConstraints?: LogicConstraint[];
}
