import type { ReactNode } from "react";

import { useGuestSession } from "@/hooks/useGuestSession";

interface AuthInitializerProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AuthInitializer = ({
  children,
  fallback = <DefaultLoadingFallback />,
}: AuthInitializerProps) => {
  const { isInitializing, error, retry } = useGuestSession();

  if (isInitializing) {
    return <>{fallback}</>;
  }

  if (error) {
    return <ErrorFallback error={error} onRetry={retry} />;
  }

  return <>{children}</>;
};

const DefaultLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-gray-500">Loading...</div>
  </div>
);

interface ErrorFallbackProps {
  error: Error;
  onRetry: () => void;
}

const ErrorFallback = ({ error, onRetry }: ErrorFallbackProps) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
    <div className="text-red-500">Session initialization failed</div>
    <div className="text-gray-600 text-sm">{error.message}</div>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Retry
    </button>
  </div>
);
