import { queryOptions } from "@tanstack/react-query";

import { runsApi } from "@/api/runs";

export const runQueries = {
  all: () => ["runs"] as const,

  list: () =>
    queryOptions({
      queryKey: [...runQueries.all(), "list"],
      queryFn: () => runsApi.getList(),
      staleTime: 0,
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...runQueries.all(), "detail", id],
      queryFn: () => runsApi.getDetail(id),
      enabled: !!id,
    }),
};
