export type ConstraintType = "contains" | "not_contains" | "range" | "regex" | "max_length";

export interface LogicConstraint {
  id: string;
  type: ConstraintType;
  value?: string | number;
  target?: string;
  min?: number;
  max?: number;
  pattern?: string;
}

export type LogicConstraintInput = Omit<LogicConstraint, "id">;
