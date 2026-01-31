import type { CreateRunRequest, CreateRunResponse, RunSummary } from "@/types/run";
import type { RunDetailData } from "@/types/runDetail";

import { apiClient } from "./client";

export const runsApi = {
  async getList(): Promise<RunSummary[]> {
    return apiClient.get("runs").json<RunSummary[]>();
  },

  async getDetail(id: number): Promise<RunDetailData> {
    return apiClient.get(`runs/${id}`).json<RunDetailData>();
  },

  async create(data: CreateRunRequest): Promise<CreateRunResponse> {
    return apiClient.post("runs", { json: data }).json<CreateRunResponse>();
  },
};
