import type { ReactNode } from "react";

import { Toaster } from "sonner";

import { QueryProvider } from "./QueryProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryProvider>
      {children}
      <Toaster position="bottom-right" />
    </QueryProvider>
  );
};
