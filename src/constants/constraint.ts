import type { ConstraintType } from "@/types/constraint";

export const CONSTRAINT_TYPE_OPTIONS: { value: ConstraintType; label: string }[] = [
  { value: "contains", label: "포함" },
  { value: "not_contains", label: "미포함" },
  { value: "range", label: "범위" },
  { value: "regex", label: "정규식" },
  { value: "max_length", label: "최대 길이" },
];
