import { z } from "zod";

export type ConstraintType = "contains" | "not_contains" | "range" | "regex" | "max_length";

// BE와 일치 (id 없음, target 필수)
export type LogicConstraint =
  | { type: "contains"; target: string; value: string }
  | { type: "not_contains"; target: string; value: string }
  | { type: "range"; target: string; min?: number; max?: number }
  | { type: "regex"; target: string; pattern: string }
  | { type: "max_length"; target: string; max: number };

export type ProfileConstraint = LogicConstraint;

export const logicConstraintSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("contains"),
    target: z.string().min(1, "대상 필드를 입력하세요"),
    value: z.string().min(1, "값을 입력하세요"),
  }),
  z.object({
    type: z.literal("not_contains"),
    target: z.string().min(1, "대상 필드를 입력하세요"),
    value: z.string().min(1, "값을 입력하세요"),
  }),
  z.object({
    type: z.literal("range"),
    target: z.string().min(1, "대상 필드를 입력하세요"),
    min: z.number().nullable(),
    max: z.number().nullable(),
  }),
  z.object({
    type: z.literal("regex"),
    target: z.string().min(1, "대상 필드를 입력하세요"),
    pattern: z.string().min(1, "패턴을 입력하세요"),
  }),
  z.object({
    type: z.literal("max_length"),
    target: z.string().min(1, "대상 필드를 입력하세요"),
    max: z.number().min(1, "최대 길이를 입력하세요"),
  }),
]);

export const profileConstraintSchema = logicConstraintSchema;
