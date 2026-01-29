import { queryOptions } from "@tanstack/react-query";

import { profilesApi } from "@/api/profiles";

export const profileQueries = {
  all: () => ["profiles"] as const,

  list: () =>
    queryOptions({
      queryKey: [...profileQueries.all(), "list"],
      queryFn: profilesApi.getList,
      staleTime: 1000 * 60 * 5,
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...profileQueries.all(), "detail", id],
      queryFn: () => profilesApi.getDetail(id),
      staleTime: 1000 * 60 * 5,
      enabled: !!id,
    }),
};
