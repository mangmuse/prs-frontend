import { z } from "zod";

export type ConstraintType = "contains" | "not_contains" | "range" | "regex" | "max_length";

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

export type LogicConstraint = z.infer<typeof logicConstraintSchema>;
