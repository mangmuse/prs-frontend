import { useEffect, useRef } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { runQueries } from "@/queries/runQueries";

type UseRunStatusPollingCallbacks = {
  onComplete: () => void;
  onFail: () => void;
};

export const useRunStatusPolling = (runId: number, callbacks: UseRunStatusPollingCallbacks) => {
  const queryClient = useQueryClient();
  const { data: statusData } = useQuery(runQueries.status(runId));
  const prevStatusRef = useRef<string>();

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    const currentStatus = statusData?.status;

    if (prevStatus === "running" && currentStatus === "completed") {
      void queryClient.invalidateQueries({
        queryKey: [...runQueries.all(), "detailInfinite", runId],
      });
      callbacks.onComplete();
    }

    if (prevStatus === "running" && currentStatus === "failed") {
      callbacks.onFail();
    }

    if (currentStatus) {
      prevStatusRef.current = currentStatus;
    }
  }, [statusData?.status, runId, queryClient, callbacks]);
};
