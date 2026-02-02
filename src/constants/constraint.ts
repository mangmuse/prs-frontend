import type { ConstraintType } from "@/types/constraint";

export const CONSTRAINT_TYPE_OPTIONS: { value: ConstraintType; label: string }[] = [
  { value: "contains", label: "포함 (contains)" },
  { value: "not_contains", label: "미포함 (not_contains)" },
  { value: "range", label: "범위 (range)" },
  { value: "regex", label: "정규식 (regex)" },
  { value: "max_length", label: "최대 길이 (max_length)" },
];
