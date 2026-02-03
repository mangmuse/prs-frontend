export interface ModelInfo {
  id: string;
  displayName: string;
  provider: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
}
