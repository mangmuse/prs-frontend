import { z } from "zod";

import { SCHEMA_OPTIONS } from "@/constants/prompt";

export const versionFormSchema = z.object({
  systemInstruction: z.string(),
  userTemplate: z.string().min(1, "유저 템플릿을 입력해주세요"),
  model: z.string().min(1, "모델을 선택해주세요"),
  temperature: z.number().min(0).max(2),
  outputSchema: z.enum(SCHEMA_OPTIONS),
  memo: z.string().optional(),
});

export type VersionFormData = z.infer<typeof versionFormSchema>;

export const versionFormDefaults: VersionFormData = {
  systemInstruction: "",
  userTemplate: "",
  model: "",
  temperature: 1.0,
  outputSchema: "JSON Object",
  memo: "",
};
