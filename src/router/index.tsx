import { createBrowserRouter } from "react-router";

import { HomePage } from "@/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);
