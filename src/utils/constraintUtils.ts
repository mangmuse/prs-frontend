import type { ConstraintType, ProfileConstraint } from "@/types/constraint";

export const getDefaultConstraint = (type: ConstraintType): ProfileConstraint => {
  switch (type) {
    case "contains":
      return { type: "contains", target: "", value: "" };
    case "not_contains":
      return { type: "not_contains", target: "", value: "" };
    case "range":
      return { type: "range", target: "", min: 0, max: 1 };
    case "regex":
      return { type: "regex", target: "", pattern: "" };
    case "max_length":
      return { type: "max_length", target: "", max: 100 };
  }
};
