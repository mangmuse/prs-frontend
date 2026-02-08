import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { datasetsApi } from "@/api/datasets";

export const datasetQueries = {
  all: () => ["datasets"] as const,

  list: () =>
    queryOptions({
      queryKey: [...datasetQueries.all(), "list"],
      queryFn: () => datasetsApi.getList(),
    }),

  detail: (id: number, page = 1, limit = 50) =>
    queryOptions({
      queryKey: [...datasetQueries.all(), "detail", id, { page, limit }],
      queryFn: () => datasetsApi.getDetail(id, page, limit),
      placeholderData: keepPreviousData,
      enabled: !!id,
      gcTime: page === 1 ? Infinity : 1000 * 60 * 10, // 1페이지만 영구 보관
    }),
};
