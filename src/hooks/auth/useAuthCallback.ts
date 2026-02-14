import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/shallow";

import { authQueries } from "@/queries/authQueries";
import { useAuthStore } from "@/stores/authStore";

interface UseAuthCallbackResult {
  isExchanging: boolean;
  exchangeError: Error | null;
  wasGuest: boolean;
  isAuthenticated: boolean;
}

export const useAuthCallback = (code: string | null): UseAuthCallbackResult => {
  const navigate = useNavigate();

  const { isAuthenticated, setAccessToken, setInitialized } = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      setAccessToken: state.setAccessToken,
      setInitialized: state.setInitialized,
    })),
  );

  const tokenQuery = useQuery({
    ...authQueries.tokenExchange(code),
    enabled: !!code,
  });

  const wasGuest = tokenQuery.data?.wasGuest ?? false;

  useEffect(() => {
    if (!tokenQuery.data) return;
    setAccessToken(tokenQuery.data.accessToken);
    setInitialized();
  }, [tokenQuery.data, setAccessToken, setInitialized]);

  useQuery({
    ...authQueries.me(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated || wasGuest) return;
    void navigate("/", { replace: true });
  }, [isAuthenticated, wasGuest, navigate]);

  useEffect(() => {
    if (!tokenQuery.error) return;
    const timer = setTimeout(() => navigate("/", { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [tokenQuery.error, navigate]);

  return {
    isExchanging: tokenQuery.isPending && !!code,
    exchangeError: tokenQuery.error,
    wasGuest,
    isAuthenticated,
  };
};
