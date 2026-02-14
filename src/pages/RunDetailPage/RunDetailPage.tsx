import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useQuery } from "@tanstack/react-query";

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
import type { StatusFilter } from "@/types/runDetail";

export const RunDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const runId = Number(id);

  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: run, isPending, isError } = useQuery(runQueries.detail(runId));
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
      if (statusFilter === "regressed") {
        return compareMode.rowChanges?.get(r.rowIndex)?.category === "regressed";
      }
      if (statusFilter === "improved") {
        return compareMode.rowChanges?.get(r.rowIndex)?.category === "improved";
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
          void navigate(`/runs/${newRun.id}`);
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
