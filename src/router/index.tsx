import { createBrowserRouter } from "react-router";

import { AppLayout } from "@/components/layout/AppLayout";
import { DatasetsPage } from "@/pages/DatasetsPage";
import { HomePage } from "@/pages/HomePage";
import { ProfilesPage } from "@/pages/ProfilesPage";
import { PromptsPage } from "@/pages/PromptsPage";
import { RunDetailPage } from "@/pages/RunDetailPage";
import { RunsPage } from "@/pages/RunsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "prompts", element: <PromptsPage /> },
      { path: "datasets", element: <DatasetsPage /> },
      { path: "profiles", element: <ProfilesPage /> },
      { path: "runs", element: <RunsPage /> },
      { path: "runs/:id", element: <RunDetailPage /> },
    ],
  },
]);
