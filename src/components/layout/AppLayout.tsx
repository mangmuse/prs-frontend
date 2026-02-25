import { Outlet } from "react-router";

import { usePageView } from "@/hooks/usePageView";
import { AuthInitializer } from "@/providers/AuthInitializer";

import { ErrorBoundary } from "./ErrorBoundary";
import { MobileBlockScreen } from "./MobileBlockScreen";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => {
  usePageView();
  return (
    <>
      <MobileBlockScreen />
      <AuthInitializer>
        <div className="hidden md:flex h-screen bg-background text-foreground">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </AuthInitializer>
    </>
  );
};
