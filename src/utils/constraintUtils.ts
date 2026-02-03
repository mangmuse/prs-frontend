import type { ConstraintType, LogicConstraint } from "@/types/constraint";

const assertNever = (x: never): never => {
  throw new Error(`Unexpected constraint type: ${JSON.stringify(x)}`);
};

export const CONSTRAINT_TYPE_LABELS: Record<LogicConstraint["type"], string> = {
  contains: "포함",
  not_contains: "미포함",
  range: "범위",
  regex: "정규식",
  max_length: "최대 길이",
};

export const getConstraintValueDisplay = (constraint: LogicConstraint): string | null => {
  switch (constraint.type) {
    case "contains":
    case "not_contains":
      return constraint.value || null;
    case "range":
      if (constraint.min === null && constraint.max === null) return null;
      return `${constraint.min ?? "-"} ~ ${constraint.max ?? "-"}`;
    case "regex":
      return constraint.pattern || null;
    case "max_length":
      return `max ${constraint.max}`;
    default:
      return assertNever(constraint);
  }
};

export const getDefaultConstraint = (type: ConstraintType): LogicConstraint => {
  switch (type) {
    case "contains":
      return { type: "contains", target: "", value: "" };
    case "not_contains":
      return { type: "not_contains", target: "", value: "" };
    case "range":
      return { type: "range", target: "", min: null, max: null };
    case "regex":
      return { type: "regex", target: "", pattern: "" };
    case "max_length":
      return { type: "max_length", target: "", max: 100 };
  }
};
