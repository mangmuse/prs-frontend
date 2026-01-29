import { queryOptions } from "@tanstack/react-query";

import { promptsApi } from "@/api/prompts";

export const promptQueries = {
  all: () => ["prompts"] as const,

  list: () =>
    queryOptions({
      queryKey: [...promptQueries.all(), "list"],
      queryFn: promptsApi.getList,
      staleTime: 1000 * 60 * 5,
    }),

  versions: (promptId: number) =>
    queryOptions({
      queryKey: [...promptQueries.all(), "versions", promptId],
      queryFn: () => promptsApi.getVersions(promptId),
      staleTime: 1000 * 60 * 5,
      enabled: !!promptId,
    }),

  versionDetail: (promptId: number, versionId: number) =>
    queryOptions({
      queryKey: [...promptQueries.all(), "versionDetail", promptId, versionId],
      queryFn: () => promptsApi.getVersionDetail(promptId, versionId),
      staleTime: 1000 * 60 * 5,
      enabled: !!promptId && !!versionId,
    }),
};
