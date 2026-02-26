import { useEffect, useRef } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";

import { runQueries } from "@/queries/runQueries";
import type { RunDetailData } from "@/types/runDetail";

export const useRunDetailInfinite = (runId: number) => {
  const {
    data: infiniteData,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(runQueries.detailInfinite(runId));

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

  return { run, isPending, isError, isFetchingNextPage, loadMoreRef };
};
