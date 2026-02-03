import { z } from "zod";

export const inputFieldSchema = z.object({
  key: z.string().min(1, "키는 필수입니다"),
  value: z.string(),
});

export const rowSchema = z.object({
  inputFields: z.array(inputFieldSchema).min(1),
  expected: z.string(),
  tags: z.string(),
});

export const createDatasetSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다"),
  description: z.string(),
  rows: z.array(rowSchema).min(1),
});

export type InputField = z.infer<typeof inputFieldSchema>;
export type Row = z.infer<typeof rowSchema>;
export type CreateDatasetFormData = z.infer<typeof createDatasetSchema>;
