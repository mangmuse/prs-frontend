import { z } from "zod";

export const constraintSchema = z.object({
  id: z.string(),
  type: z.enum(["contains", "not_contains", "range", "regex", "max_length"]),
  value: z.union([z.string(), z.number()]).optional(),
  target: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
});

export const inputFieldSchema = z.object({
  key: z.string().min(1, "키는 필수입니다"),
  value: z.string(),
});

export const rowSchema = z.object({
  inputFields: z.array(inputFieldSchema).min(1),
  expected: z.string(),
  tags: z.string(),
  constraints: z.array(constraintSchema),
});

export const createDatasetSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다"),
  description: z.string(),
  rows: z.array(rowSchema).min(1),
});

export type InputField = z.infer<typeof inputFieldSchema>;
export type Constraint = z.infer<typeof constraintSchema>;
export type Row = z.infer<typeof rowSchema>;
export type CreateDatasetFormData = z.infer<typeof createDatasetSchema>;
