import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { datasetsApi } from "@/api/datasets";

export const datasetQueries = {
  all: () => ["datasets"] as const,

  list: () =>
    queryOptions({
      queryKey: [...datasetQueries.all(), "list"],
      queryFn: datasetsApi.getList,
      staleTime: 1000 * 60 * 5,
    }),

  detail: (id: number, page = 1, limit = 50) =>
    queryOptions({
      queryKey: [...datasetQueries.all(), "detail", id, { page, limit }],
      queryFn: () => datasetsApi.getDetail(id, page, limit),
      staleTime: 1000 * 60 * 5,
      placeholderData: keepPreviousData,
      enabled: !!id,
    }),
};
