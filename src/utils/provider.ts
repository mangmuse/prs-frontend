import type { LLMProvider } from "@/stores/apiKeyStore";

export const LLM_PROVIDER_IDS = [
  "openai",
  "anthropic",
  "gemini",
] as const satisfies readonly LLMProvider[];

export const LLM_PROVIDER_OPTIONS = [
  { id: "openai", name: "OpenAI", placeholder: "sk-..." },
  { id: "anthropic", name: "Anthropic", placeholder: "sk-ant-..." },
  { id: "gemini", name: "Google Gemini", placeholder: "AI..." },
] as const satisfies ReadonlyArray<{
  id: LLMProvider;
  name: string;
  placeholder: string;
}>;

export const isLLMProvider = (value: string): value is LLMProvider => {
  return LLM_PROVIDER_IDS.some((provider) => provider === value);
};

export type ProviderOption = (typeof LLM_PROVIDER_OPTIONS)[number];

export const extractProvider = (model: string): LLMProvider | null => {
  if (!model.includes("/")) return null;
  const provider = model.split("/")[0];
  return isLLMProvider(provider) ? provider : null;
};
