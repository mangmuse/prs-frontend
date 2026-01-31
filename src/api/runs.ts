import type { CreateRunRequest, CreateRunResponse, RunSummary } from "@/types/run";

import { apiClient } from "./client";

export const runsApi = {
  async getList(): Promise<RunSummary[]> {
    return apiClient.get("runs").json<RunSummary[]>();
  },

  async create(data: CreateRunRequest): Promise<CreateRunResponse> {
    return apiClient.post("runs", { json: data }).json<CreateRunResponse>();
  },
};
