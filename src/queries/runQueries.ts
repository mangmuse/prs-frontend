import { infiniteQueryOptions, keepPreviousData, queryOptions } from "@tanstack/react-query";

import { runsApi } from "@/api/runs";
import type { RunDetailData } from "@/types/runDetail";

export const RUN_DETAIL_PAGE_SIZE = 50;

export const runQueries = {
  all: () => ["runs"] as const,

  list: (grouped: boolean = true) =>
    queryOptions({
      queryKey: [...runQueries.all(), "list", { grouped }],
      queryFn: () => runsApi.getList(grouped),
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...runQueries.all(), "detail", id],
      queryFn: () => runsApi.getDetail(id),
      enabled: !!id,
      refetchInterval: (query) => (query.state.data?.status === "running" ? 3000 : false),
    }),

  detailInfinite: (id: number, status?: string) =>
    infiniteQueryOptions({
      queryKey: [...runQueries.all(), "detailInfinite", id, { status }],
      queryFn: ({ pageParam }) =>
        runsApi.getDetail(id, {
          limit: RUN_DETAIL_PAGE_SIZE,
          cursor: pageParam ?? undefined,
          status,
        }),
      initialPageParam: null as number | null,
      getNextPageParam: (lastPage: RunDetailData) => lastPage.nextCursor,
      enabled: !!id,
      placeholderData: keepPreviousData,
    }),

  status: (id: number) =>
    queryOptions({
      queryKey: [...runQueries.all(), "status", id],
      queryFn: () => runsApi.getStatus(id),
      refetchInterval: (query) => (query.state.data?.status === "running" ? 3000 : false),
      enabled: !!id,
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
