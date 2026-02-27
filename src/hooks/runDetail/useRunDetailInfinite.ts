import { useEffect, useRef } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";

import { runQueries } from "@/queries/runQueries";
import type { RunDetailData, StatusFilter } from "@/types/runDetail";

const toApiStatus = (filter: StatusFilter): string | undefined => {
  if (filter === "all") return undefined;
  if (filter === "pass" || filter === "fail") return filter;
  return undefined;
};

export const useRunDetailInfinite = (
  runId: number,
  statusFilter: StatusFilter = "all",
  fetchAll = false,
) => {
  const apiStatus = toApiStatus(statusFilter);

  const {
    data: infiniteData,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(runQueries.detailInfinite(runId, apiStatus));

  const run = (() => {
    if (!infiniteData?.pages.length) return undefined;
    const firstPage = infiniteData.pages[0];
    return {
      ...firstPage,
      results: infiniteData.pages.flatMap((page) => page.results),
    } as RunDetailData;
  })();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (fetchAll && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchAll, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { run, isPending, isError, isFetchingNextPage, loadMoreRef };
};
