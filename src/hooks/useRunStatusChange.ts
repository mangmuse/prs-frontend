import { useEffect, useRef } from "react";

import type { RunStatus, RunSummary } from "@/types/run";

interface UseRunStatusChangeOptions {
  onCompleted?: (run: RunSummary) => void;
  onFailed?: (run: RunSummary) => void;
}

export const useRunStatusChange = (runs: RunSummary[], options: UseRunStatusChangeOptions) => {
  const prevStatusMapRef = useRef<Map<number, RunStatus>>(new Map());

  useEffect(() => {
    const prevMap = prevStatusMapRef.current;

    runs.forEach((run) => {
      const prevStatus = prevMap.get(run.id);

      if (prevStatus === "running") {
        if (run.status === "completed") {
          options.onCompleted?.(run);
        } else if (run.status === "failed") {
          options.onFailed?.(run);
        }
      }

      prevMap.set(run.id, run.status);
    });
  }, [runs, options]);
};
