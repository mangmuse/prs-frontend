import { Outlet } from "react-router";

import { MobileBlockScreen } from "./MobileBlockScreen";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => {
  return (
    <>
      <MobileBlockScreen />
      <div className="hidden md:flex h-screen bg-muted/30">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
};
