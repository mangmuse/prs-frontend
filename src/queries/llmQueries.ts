import { queryOptions } from "@tanstack/react-query";

import { llmApi } from "@/api/llm";

export const llmQueries = {
  all: () => ["llm"] as const,

  models: () =>
    queryOptions({
      queryKey: [...llmQueries.all(), "models"],
      queryFn: () => llmApi.getModels(),
      staleTime: 1000 * 60 * 5,
    }),
};
