export interface ModelInfo {
  id: string;
  displayName: string;
  provider: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export interface VerifyKeyResponse {
  valid: boolean;
  error: string | null;
}
