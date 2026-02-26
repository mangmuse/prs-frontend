import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { LiveProfileEditor } from "@/components/runs/LiveProfileEditor";
import { RunDetailBanners } from "@/components/runs/RunDetailBanners";
import { RunDetailFilters } from "@/components/runs/RunDetailFilters";
import { RunDetailHeader } from "@/components/runs/RunDetailHeader";
import { RunDetailMetricsGrid } from "@/components/runs/RunDetailMetricsGrid";
import { RunDetailResultsSplit } from "@/components/runs/RunDetailResultsSplit";
import { RunDetailSummaryCards } from "@/components/runs/RunDetailSummaryCards";
import { RunDetailVersionAndCompare } from "@/components/runs/RunDetailVersionAndCompare";
import { useCreateRun } from "@/hooks/mutations/runMutations";
import { useCompareMode } from "@/hooks/runDetail/useCompareMode";
import { useLiveSimulation } from "@/hooks/runDetail/useLiveSimulation";
import { runQueries } from "@/queries/runQueries";
import type { RunDetailData, StatusFilter } from "@/types/runDetail";

export const RunDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const runId = Number(id);

  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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

  const { data: relatedVersions } = useQuery(runQueries.relatedVersions(runId));
  const createRun = useCreateRun();

  const liveSimulation = useLiveSimulation({ run });

  const compareMode = useCompareMode({
    runId,
    run,
    previewResults: liveSimulation.previewResults,
  });

  const filteredResults = useMemo(() => {
    return liveSimulation.activeResults.filter((r) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "pass") return r.status === "pass";
      if (statusFilter === "fail") return r.status !== "pass";
      if (
        statusFilter === "regressed" ||
        statusFilter === "improved" ||
        statusFilter === "changed" ||
        statusFilter === "unchanged"
      ) {
        return compareMode.rowChanges?.get(r.rowIndex)?.category === statusFilter;
      }
      return true;
    });
  }, [liveSimulation.activeResults, statusFilter, compareMode.rowChanges]);

  const selectedResult = liveSimulation.activeResults.find((r) => r.id === selectedResultId);

  const baseResult =
    selectedResult && compareMode.isCompareMode
      ? compareMode.getBaseResult(selectedResult.datasetRowId)
      : undefined;

  const handleBackToList = () => {
    void navigate("/runs");
  };

  const handleExecuteVersion = (versionId: number) => {
    if (!run) return;
    createRun.mutate(
      {
        promptVersionId: versionId,
        datasetId: run.datasetId,
        profileId: run.profileId,
      },
      {
        onSuccess: (newRun) => {
          toast.success("실행이 시작되었습니다");
          void navigate(`/runs/${newRun.id}`);
        },
        onError: () => {
          toast.error("실행에 실패했습니다");
        },
      },
    );
  };

  const handleCompareSelect = (targetId: string) => {
    compareMode.handleCompareSelect(targetId);
    setStatusFilter("all");
  };

  const handleCancelCompare = () => {
    compareMode.handleCancelCompare();
    setStatusFilter("all");
  };

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (isError || !run) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Run을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <title>PRS | 실행 상세</title>
      <RunDetailHeader
        promptName={run.promptName}
        datasetName={run.datasetName}
        versionNumber={run.versionNumber}
        isLiveEditorOpen={liveSimulation.isLiveEditorOpen}
        onBack={handleBackToList}
        onToggleLiveEditor={liveSimulation.handleToggleLiveEditor}
      />

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-auto p-6 min-w-0">
          <div className="space-y-6">
            <RunDetailVersionAndCompare
              runId={runId}
              runVersionNumber={run.versionNumber}
              relatedVersions={relatedVersions}
              compareTargetVersionNumber={compareMode.compareTargetVersionNumber}
              isCompareMode={compareMode.isCompareMode}
              onExecuteVersion={handleExecuteVersion}
              onCompareSelect={handleCompareSelect}
              onCancelCompare={handleCancelCompare}
            />

            <RunDetailBanners
              isLiveEditorOpen={liveSimulation.isLiveEditorOpen}
              isCompareMode={compareMode.isCompareMode}
              stats={compareMode.stats}
            />

            <RunDetailSummaryCards
              summary={compareMode.summary}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />

            <RunDetailMetricsGrid
              metricsAsPercent={liveSimulation.metricsAsPercent}
              metricsDelta={compareMode.metricsDelta}
            />

            <RunDetailFilters
              statusFilter={statusFilter}
              totalCount={liveSimulation.totalCount}
              passCount={liveSimulation.passCount}
              failCount={liveSimulation.failCount}
              isCompareMode={compareMode.isCompareMode}
              summary={compareMode.summary}
              onStatusFilterChange={setStatusFilter}
            />

            <RunDetailResultsSplit
              filteredResults={filteredResults}
              selectedId={selectedResultId}
              onSelect={setSelectedResultId}
              isCompareMode={compareMode.isCompareMode}
              rowChanges={compareMode.rowChanges}
              selectedResult={selectedResult}
              baseResult={baseResult}
            />

            <div ref={loadMoreRef}>
              {isFetchingNextPage && (
                <p className="py-4 text-center text-sm text-muted-foreground">더 불러오는 중...</p>
              )}
            </div>
          </div>
        </div>

        {liveSimulation.isLiveEditorOpen && (
          <LiveProfileEditor
            run={run}
            onClose={liveSimulation.handleCloseLiveEditor}
            onPreviewUpdate={liveSimulation.setPreviewResults}
          />
        )}
      </div>
    </div>
  );
};
