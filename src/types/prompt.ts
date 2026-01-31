export type OutputSchemaType = "JSON Object" | "JSON Array" | "Label" | "Freeform";

export interface PromptSummary {
  id: number;
  name: string;
  description: string | null;
  latest_version: number | null;
  version_count: number;
  created_at: string;
}

export interface VersionSummary {
  id: number;
  version_number: number;
  model: string;
  memo: string | null;
  user_template: string;
  created_at: string;
}

export interface VersionDetail {
  id: number;
  prompt_id: number;
  version_number: number;
  system_instruction: string;
  user_template: string;
  model: string;
  temperature: number;
  output_schema: OutputSchemaType;
  memo: string | null;
  created_at: string;
}

export interface CreatePromptRequest {
  name: string;
  description?: string;
}

export interface CreatePromptResponse {
  id: number;
  name: string;
  created_at: string;
}

export interface CreateVersionRequest {
  system_instruction: string;
  user_template: string;
  model: string;
  temperature: number;
  output_schema: OutputSchemaType;
  memo?: string;
}
