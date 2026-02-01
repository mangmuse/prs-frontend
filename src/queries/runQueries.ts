import { queryOptions } from "@tanstack/react-query";

import { runsApi } from "@/api/runs";

export const runQueries = {
  all: () => ["runs"] as const,

  list: (grouped: boolean = true) =>
    queryOptions({
      queryKey: [...runQueries.all(), "list", { grouped }],
      queryFn: () => runsApi.getList(grouped),
      staleTime: 0,
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...runQueries.all(), "detail", id],
      queryFn: () => runsApi.getDetail(id),
      enabled: !!id,
      refetchInterval: (query) => (query.state.data?.status === "running" ? 3000 : false),
    }),

  relatedVersions: (runId: number) =>
    queryOptions({
      queryKey: [...runQueries.all(), "relatedVersions", runId],
      queryFn: () => runsApi.getRelatedVersions(runId),
      enabled: !!runId,
    }),

  comparison: (baseRunId: number, targetRunId: number) =>
    queryOptions({
      queryKey: [...runQueries.all(), "comparison", baseRunId, targetRunId],
      queryFn: () => runsApi.compareRuns(baseRunId, targetRunId),
      enabled: !!baseRunId && !!targetRunId,
    }),
};
