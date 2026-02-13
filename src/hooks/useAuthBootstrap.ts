import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/shallow";

import { authQueries } from "@/queries/authQueries";
import { useAuthStore } from "@/stores/authStore";

interface UseAuthBootstrapResult {
  isInitializing: boolean;
  error: Error | null;
  retry: () => void;
}

export const useAuthBootstrap = (): UseAuthBootstrapResult => {
  const { isInitialized, isAuthenticated, setAccessToken, setGuest, setInitialized } = useAuthStore(
    useShallow((state) => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      setAccessToken: state.setAccessToken,
      setGuest: state.setGuest,
      setInitialized: state.setInitialized,
    })),
  );

  const refreshQuery = useQuery({
    ...authQueries.refresh(),
    enabled: !isInitialized && !isAuthenticated,
  });

  useEffect(() => {
    if (!refreshQuery.data) return;
    setAccessToken(refreshQuery.data.accessToken);
  }, [refreshQuery.data, setAccessToken]);

  const meQuery = useQuery({
    ...authQueries.me(),
    enabled: isAuthenticated && !isInitialized,
  });

  useEffect(() => {
    if (!meQuery.data) return;
    setInitialized();
  }, [meQuery.data, setInitialized]);

  const shouldFallbackToGuest = refreshQuery.isError || meQuery.isError;

  const guestQuery = useQuery({
    ...authQueries.guestSession(),
    enabled: !isInitialized && shouldFallbackToGuest,
  });

  useEffect(() => {
    if (!guestQuery.data) return;
    setGuest();
    setInitialized();
  }, [guestQuery.data, setGuest, setInitialized]);

  const isInitializing =
    !isInitialized && (refreshQuery.isPending || meQuery.isPending || guestQuery.isPending);

  const error = shouldFallbackToGuest && guestQuery.isError ? guestQuery.error : null;

  return {
    isInitializing,
    error,
    retry: () => void guestQuery.refetch(),
  };
};
