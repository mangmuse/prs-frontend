import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { RunMetricsCards } from "@/components/runs/RunMetricsCards";
import { RunResultDetailPanel } from "@/components/runs/RunResultDetailPanel";
import { RunResultsTable } from "@/components/runs/RunResultsTable";
import { RunVersionTabs } from "@/components/runs/RunVersionTabs";
import { Button } from "@/components/ui/button";
import { useCreateRun } from "@/hooks/mutations/useCreateRun";
import { runQueries } from "@/queries/runQueries";

type StatusFilter = "all" | "pass" | "fail";

export const RunDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const runId = Number(id);

  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: run, isPending, isError } = useQuery(runQueries.detail(runId));
  const { data: relatedVersions } = useQuery(runQueries.relatedVersions(runId));
  const createRun = useCreateRun();

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

  const handleBackToList = () => {
    void navigate("/runs");
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

  const selectedResult = run.results.find((r) => r.id === selectedResultId);

  const filteredResults = run.results.filter((r) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pass") return r.status === "pass";
    return r.status !== "pass";
  });

  const passCount = run.results.filter((r) => r.status === "pass").length;
  const failCount = run.results.length - passCount;

  const metricsAsPercent = {
    passRate: run.metrics.passRate * 100,
    formatPassRate: run.metrics.formatPassRate * 100,
    semanticPassRate: run.metrics.semanticPassRate * 100,
    logicPassRate: run.metrics.logicPassRate * 100,
    avgSemantic: run.metrics.avgSemantic,
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
        <MobileSidebar />
        <Button variant="ghost" size="icon" onClick={handleBackToList}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-xl font-semibold">{run.promptName}</h1>
          <span className="text-muted-foreground">×</span>
          <span className="text-muted-foreground">{run.datasetName}</span>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {relatedVersions && (
            <RunVersionTabs
              currentRunId={runId}
              currentVersionNumber={run.versionNumber}
              executedRuns={relatedVersions.executedRuns}
              unexecutedVersions={relatedVersions.unexecutedVersions}
              onExecuteVersion={handleExecuteVersion}
            />
          )}

          <RunMetricsCards {...metricsAsPercent} />

          <div className="mb-4 flex gap-2">
            <Button
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
            >
              전체 ({run.results.length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "pass" ? "default" : "outline"}
              onClick={() => setStatusFilter("pass")}
            >
              Pass ({passCount})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "fail" ? "default" : "outline"}
              onClick={() => setStatusFilter("fail")}
            >
              Fail ({failCount})
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 rounded-lg border bg-white">
              <RunResultsTable
                results={filteredResults}
                selectedId={selectedResultId}
                onSelect={setSelectedResultId}
              />
            </div>

            {selectedResult && (
              <div className="w-100 shrink-0">
                <RunResultDetailPanel result={selectedResult} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
