import type { ReactNode } from "react";

import { Toaster } from "sonner";

import { AuthInitializer } from "./AuthInitializer";
import { QueryProvider } from "./QueryProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryProvider>
      <AuthInitializer>{children}</AuthInitializer>
      <Toaster position="top-right" />
    </QueryProvider>
  );
};
