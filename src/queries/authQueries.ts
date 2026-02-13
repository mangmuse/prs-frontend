import { queryOptions } from "@tanstack/react-query";

import { authApi } from "@/api/auth";

export const authQueries = {
  all: () => ["auth"] as const,

  refresh: () =>
    queryOptions({
      queryKey: [...authQueries.all(), "refresh"],
      queryFn: () => authApi.refreshToken(),
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      gcTime: 0,
    }),

  me: () =>
    queryOptions({
      queryKey: [...authQueries.all(), "me"],
      queryFn: () => authApi.getMe(),
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 5,
    }),

  guestSession: () =>
    queryOptions({
      queryKey: [...authQueries.all(), "guest-session"],
      queryFn: () => authApi.createGuestSession(),
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }),

  tokenExchange: (code: string | null) =>
    queryOptions({
      queryKey: [...authQueries.all(), "token-exchange", code],
      queryFn: () => authApi.exchangeToken(code!),
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      gcTime: 0,
    }),
};
