import type { LogicConstraint } from "@/types/constraint";
import type { RegressionComparisonResponse } from "@/types/regression";
import type {
  CreateRunRequest,
  CreateRunResponse,
  RelatedVersionsResponse,
  RunSummary,
} from "@/types/run";
import type { ReEvaluateResponse, RunDetailData } from "@/types/runDetail";

import { apiClient } from "./client";

export const runsApi = {
  async getList(grouped: boolean = true): Promise<RunSummary[]> {
    const searchParams = grouped ? {} : { grouped: "false" };
    return apiClient.get("runs", { searchParams }).json<RunSummary[]>();
  },

  async getDetail(
    id: number,
    params?: { cursor?: number; limit?: number; status?: string },
  ): Promise<RunDetailData> {
    return apiClient.get(`runs/${id}`, { searchParams: params }).json<RunDetailData>();
  },

  async getRelatedVersions(runId: number): Promise<RelatedVersionsResponse> {
    return apiClient.get(`runs/${runId}/related-versions`).json<RelatedVersionsResponse>();
  },

  async create(data: CreateRunRequest): Promise<CreateRunResponse> {
    return apiClient.post("runs", { json: data }).json<CreateRunResponse>();
  },

  async compareRuns(baseRunId: number, targetRunId: number): Promise<RegressionComparisonResponse> {
    return apiClient
      .get(`runs/${targetRunId}/compare/${baseRunId}`)
      .json<RegressionComparisonResponse>();
  },

  async updateProfileSnapshot(
    runId: number,
    data: { semanticThreshold: number; globalConstraints: LogicConstraint[] },
  ): Promise<void> {
    await apiClient.patch(`runs/${runId}/profile-snapshot`, { json: data });
  },

  async delete(runId: number): Promise<void> {
    await apiClient.delete(`runs/${runId}`);
  },

  async reEvaluate(
    runId: number,
    data: { semanticThreshold: number; globalConstraints: LogicConstraint[] },
  ): Promise<ReEvaluateResponse> {
    return apiClient.post(`runs/${runId}/re-evaluate`, { json: data }).json<ReEvaluateResponse>();
  },
};
