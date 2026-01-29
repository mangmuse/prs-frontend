import type { LogicConstraint, LogicConstraintInput } from "./common";

export interface ProfileSummary {
  id: number;
  name: string;
  description: string | null;
  semantic_threshold: number;
  constraint_count: number;
  created_at: string;
}

export interface ProfileDetail {
  id: number;
  name: string;
  description: string | null;
  semantic_threshold: number;
  global_constraints: LogicConstraint[];
  created_at: string;
  updated_at: string | null;
}

export interface CreateProfileRequest {
  name: string;
  description?: string;
  semantic_threshold: number;
  global_constraints: LogicConstraintInput[];
}

export interface UpdateProfileRequest {
  name?: string;
  description?: string;
  semantic_threshold?: number;
  global_constraints?: LogicConstraintInput[];
}
