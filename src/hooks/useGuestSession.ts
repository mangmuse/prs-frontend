import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/shallow";

import { authApi } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";

interface UseGuestSessionResult {
  isInitializing: boolean;
  error: Error | null;
  retry: () => void;
}

export const useGuestSession = (): UseGuestSessionResult => {
  const { isInitialized, setGuest, setInitialized } = useAuthStore(
    useShallow((state) => ({
      isInitialized: state.isInitialized,
      setGuest: state.setGuest,
      setInitialized: state.setInitialized,
    })),
  );

  const query = useQuery({
    queryKey: ["auth", "guest-session"],
    queryFn: authApi.createGuestSession,
    enabled: !isInitialized,
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.data && !isInitialized) {
      setGuest();
      setInitialized();
    }
  }, [query.data, isInitialized, setGuest, setInitialized]);

  return {
    isInitializing: query.isPending,
    error: query.error,
    retry: () => void query.refetch(),
  };
};
