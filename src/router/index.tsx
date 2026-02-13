import { createBrowserRouter } from "react-router";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { DatasetsPage } from "@/pages/DatasetsPage";
import { HomePage } from "@/pages/HomePage";
import { ProfilesPage } from "@/pages/ProfilesPage";
import { PromptsPage } from "@/pages/PromptsPage";
import { RunDetailPage } from "@/pages/RunDetailPage/RunDetailPage";
import { RunsPage } from "@/pages/RunsPage";
import { SettingsPage } from "@/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "auth/callback",
    element: <AuthCallbackPage />,
  },
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
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
