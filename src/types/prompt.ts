export type OutputSchemaType = "JSON Object" | "JSON Array" | "Label" | "Freeform";

export interface PromptSummary {
  id: number;
  name: string;
  description: string | null;
  latestVersion: number | null;
  versionCount: number;
  createdAt: string;
}

export interface VersionSummary {
  id: number;
  versionNumber: number;
  model: string;
  memo: string | null;
  userTemplate: string;
  createdAt: string;
}

export interface VersionDetail {
  id: number;
  promptId: number;
  versionNumber: number;
  systemInstruction: string;
  userTemplate: string;
  model: string;
  temperature: number;
  outputSchema: OutputSchemaType;
  memo: string | null;
  createdAt: string;
}

export interface CreatePromptRequest {
  name: string;
  description?: string;
}

export interface CreatePromptResponse {
  id: number;
  name: string;
  createdAt: string;
}

export interface UpdatePromptRequest {
  name?: string;
  description?: string;
}

export interface UpdatePromptResponse {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface CreateVersionRequest {
  systemInstruction: string;
  userTemplate: string;
  model: string;
  temperature: number;
  outputSchema: OutputSchemaType;
  memo?: string;
}
