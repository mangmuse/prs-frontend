import { z } from "zod";

import { logicConstraintSchema } from "@/types/constraint";

export const profileFormSchema = z.object({
  name: z.string().min(1, "프로필 이름을 입력하세요"),
  description: z.string().optional(),
  semanticThreshold: z.number().min(0).max(1),
  globalConstraints: z.array(logicConstraintSchema),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
