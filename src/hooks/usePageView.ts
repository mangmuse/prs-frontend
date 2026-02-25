import { useEffect } from "react";
import { useLocation } from "react-router";

import { sendPageView } from "@/utils/gtag";

export const usePageView = (): void => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    sendPageView(pathname + search);
  }, [pathname, search]);
};
