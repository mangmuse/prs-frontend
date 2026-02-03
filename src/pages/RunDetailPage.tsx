import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FlaskConical,
  HelpCircle,
  Minus,
  RefreshCcw,
  Settings2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { LiveProfileEditor } from "@/components/runs/LiveProfileEditor";
import { RunResultDetailPanel } from "@/components/runs/RunResultDetailPanel";
import { RunResultsTable } from "@/components/runs/RunResultsTable";
import { RunVersionTabs } from "@/components/runs/RunVersionTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCreateRun } from "@/hooks/mutations/useCreateRun";
import { runQueries } from "@/queries/runQueries";
import type { RowChange } from "@/types/regression";
import type { RunResultRow } from "@/types/runDetail";
import { calculateSummary, classifyCategory } from "@/utils/regression";

type StatusFilter = "all" | "pass" | "fail" | "regressed" | "improved";

const formatPValue = (pValue: number): string => {
  if (pValue < 0.001) return "< 0.001";
  return pValue.toFixed(3);
};

const getStatisticsMessage = (pValue: number) => {
  const formatted = formatPValue(pValue);
  if (pValue < 0.01) {
    return {
      icon: CheckCircle,
      color: "bg-green-50 border-green-200 text-green-800",
      title: "매우 유의미한 변화 감지",
      description: `신뢰수준 99% 이상 (p=${formatted})`,
    };
  }
  if (pValue < 0.05) {
    return {
      icon: CheckCircle,
      color: "bg-green-50 border-green-200 text-green-800",
      title: "유의미한 변화 감지",
      description: `신뢰수준 95% 이상 (p=${formatted})`,
    };
  }
  if (pValue < 0.1) {
    return {
      icon: AlertTriangle,
      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
      title: "변화 가능성 있음",
      description: `신뢰수준 90% (p=${formatted}), 추가 데이터 권장`,
    };
  }
  return {
    icon: HelpCircle,
    color: "bg-gray-50 border-gray-200 text-gray-600",
    title: "유의미한 차이 없음",
    description: "관찰된 차이는 통계적 오차 범위 내에 있습니다",
  };
};

const CATEGORY_CONFIG = {
  regressed: {
    label: "회귀",
    color: "bg-red-50 hover:bg-red-100 border-red-200 text-red-700",
    icon: TrendingDown,
  },
  improved: {
    label: "개선",
    color: "bg-green-50 hover:bg-green-100 border-green-200 text-green-700",
    icon: TrendingUp,
  },
  changed: {
    label: "변경",
    color: "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700",
    icon: RefreshCcw,
  },
  unchanged: {
    label: "유지",
    color: "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600",
    icon: Minus,
  },
};

export const RunDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const runId = Number(id);

  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [compareTargetId, setCompareTargetId] = useState<number | null>(null);
  const [isLiveEditorOpen, setIsLiveEditorOpen] = useState(false);
  const [previewResults, setPreviewResults] = useState<RunResultRow[] | null>(null);

  const { data: run, isPending, isError } = useQuery(runQueries.detail(runId));
  const { data: relatedVersions } = useQuery(runQueries.relatedVersions(runId));
  const { data: comparisonData } = useQuery({
    ...runQueries.comparison(compareTargetId!, runId),
    enabled: compareTargetId !== null,
  });
  const { data: baseRun } = useQuery({
    ...runQueries.detail(compareTargetId!),
    enabled: compareTargetId !== null,
  });
  const createRun = useCreateRun();

  const isCompareMode = compareTargetId !== null;
  const compareTarget = relatedVersions?.executedRuns.find((r) => r.id === compareTargetId);

  const activeResults = isLiveEditorOpen && previewResults ? previewResults : run?.results || [];

  let rowChanges: Map<number, RowChange> | undefined;
  let summary:
    | { regressed: number; improved: number; changed: number; unchanged: number }
    | undefined;
  let metricsDelta:
    | { passRate: number; formatPassRate: number; semanticPassRate: number; logicPassRate: number }
    | undefined;

  if (comparisonData) {
    const effectiveComparisons = comparisonData.rowComparisons.map((r) => {
      if (previewResults) {
        const simulated = previewResults.find((p) => p.rowIndex === r.rowIndex);
        return { ...r, targetStatus: simulated?.status ?? r.targetStatus };
      }
      return r;
    });

    rowChanges = new Map(
      effectiveComparisons.map((r) => [
        r.rowIndex,
        {
          category: classifyCategory(r.baseStatus, r.targetStatus),
          baseStatus: r.baseStatus,
          targetStatus: r.targetStatus,
        },
      ]),
    );
    summary = calculateSummary(effectiveComparisons);
  }

  if (run && baseRun) {
    metricsDelta = {
      passRate: run.metrics.passRate - baseRun.metrics.passRate,
      formatPassRate: run.metrics.formatPassRate - baseRun.metrics.formatPassRate,
      semanticPassRate: run.metrics.semanticPassRate - baseRun.metrics.semanticPassRate,
      logicPassRate: run.metrics.logicPassRate - baseRun.metrics.logicPassRate,
    };
  }

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

  const handleCompareSelect = (targetId: string) => {
    if (targetId) {
      setCompareTargetId(Number(targetId));
      setStatusFilter("all");
    }
  };

  const handleCancelCompare = () => {
    setCompareTargetId(null);
    setStatusFilter("all");
  };

  const handleToggleLiveEditor = () => {
    if (isLiveEditorOpen) {
      setIsLiveEditorOpen(false);
      setPreviewResults(null);
    } else {
      setIsLiveEditorOpen(true);
    }
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

  const selectedResult = activeResults.find((r) => r.id === selectedResultId);

  const filteredResults = activeResults.filter((r) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pass") return r.status === "pass";
    if (statusFilter === "fail") return r.status !== "pass";
    if (statusFilter === "regressed") {
      return rowChanges?.get(r.rowIndex)?.category === "regressed";
    }
    if (statusFilter === "improved") {
      return rowChanges?.get(r.rowIndex)?.category === "improved";
    }
    return true;
  });

  const passCount = activeResults.filter((r) => r.status === "pass").length;
  const failCount = activeResults.length - passCount;

  // Recalculate metrics for Live Preview or use existing metrics
  const activeMetrics =
    isLiveEditorOpen && previewResults
      ? {
          passRate: passCount / activeResults.length,
          formatPassRate:
            activeResults.filter((r) => r.status !== "format").length / activeResults.length, // Approx
          semanticPassRate:
            activeResults.filter((r) => r.status !== "format" && r.status !== "semantic").length /
            activeResults.length,
          logicPassRate: passCount / activeResults.length,
          avgSemantic: run.metrics.avgSemantic, // Doesn't change with threshold
        }
      : run.metrics;

  const metricsAsPercent = {
    passRate: activeMetrics.passRate * 100,
    formatPassRate: activeMetrics.formatPassRate * 100,
    semanticPassRate: activeMetrics.semanticPassRate * 100,
    logicPassRate: activeMetrics.logicPassRate * 100,
    avgSemantic: activeMetrics.avgSemantic,
  };

  const formatDelta = (delta: number) => {
    if (delta === 0) return null;
    const percent = (delta * 100).toFixed(0);
    if (delta > 0) return <span className="text-green-600">↑{percent}</span>;
    return <span className="text-red-600">↓{Math.abs(Number(percent))}</span>;
  };

  const stats = comparisonData ? getStatisticsMessage(comparisonData.pValue) : null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-white px-6 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <MobileSidebar />
          <Button variant="ghost" size="icon" onClick={handleBackToList}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{run.promptName}</h1>
            <span className="text-muted-foreground">×</span>
            <span className="text-muted-foreground">{run.datasetName}</span>
            <Badge variant="outline" className="ml-2">
              v{run.versionNumber}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isLiveEditorOpen ? "secondary" : "outline"}
            size="sm"
            onClick={handleToggleLiveEditor}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            {isLiveEditorOpen ? "Editor 닫기" : "평가 기준 튜닝"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 min-w-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {relatedVersions && (
                <RunVersionTabs
                  currentRunId={runId}
                  currentVersionNumber={run.versionNumber}
                  executedRuns={relatedVersions.executedRuns}
                  unexecutedVersions={relatedVersions.unexecutedVersions}
                  onExecuteVersion={handleExecuteVersion}
                />
              )}

              {relatedVersions && relatedVersions.executedRuns.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">비교:</span>
                  {isCompareMode ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        v{run.versionNumber} vs v{compareTarget?.versionNumber}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={handleCancelCompare}>
                        <X className="h-4 w-4" />
                        취소
                      </Button>
                    </div>
                  ) : (
                    <select
                      className="rounded-md border px-3 py-1.5 text-sm"
                      onChange={(e) => handleCompareSelect(e.target.value)}
                      value=""
                    >
                      <option value="" disabled>
                        버전 선택
                      </option>
                      {relatedVersions.executedRuns
                        .filter((r) => r.id !== runId)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            v{r.versionNumber}와 비교
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Live Editor Mode Indicator Banner */}
            {isLiveEditorOpen && (
              <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-primary">
                <FlaskConical className="h-5 w-5" />
                <div>
                  <p className="font-semibold">실시간 시뮬레이션 모드</p>
                  <p className="text-sm opacity-90">
                    현재 수정을 통해 결과가 어떻게 변하는지 미리보고 있습니다. (원본 Run 데이터는
                    보존됩니다)
                  </p>
                </div>
              </div>
            )}

            {/* 비교 모드: 통계 결론 배너 */}
            {isCompareMode && stats && (
              <div className={`flex items-start gap-3 rounded-lg border p-4 ${stats.color}`}>
                <stats.icon className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">{stats.title}</p>
                  <p className="text-sm opacity-80">{stats.description}</p>
                </div>
              </div>
            )}

            {/* 비교 모드: 카테고리 요약 카드 */}
            {isCompareMode && summary && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.entries(summary) as [keyof typeof CATEGORY_CONFIG, number][]).map(
                  ([category, count]) => {
                    const config = CATEGORY_CONFIG[category];
                    return (
                      <Card
                        key={category}
                        className={`cursor-pointer border p-4 transition-all hover:shadow-sm ${config.color} ${
                          statusFilter === category ? "ring-2 ring-offset-1 ring-current" : ""
                        }`}
                        onClick={() =>
                          setStatusFilter(
                            category === "regressed" || category === "improved" ? category : "all",
                          )
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-white/60 p-1.5">
                              <config.icon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">{config.label}</span>
                          </div>
                          <span className="text-2xl font-bold">{count}</span>
                        </div>
                      </Card>
                    );
                  },
                )}
              </div>
            )}

            {/* Metrics Cards (with delta in compare mode) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">통과율</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {metricsAsPercent.passRate.toFixed(1)}%
                  </span>
                  {metricsDelta && formatDelta(metricsDelta.passRate)}
                </div>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">출력형식 통과</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {metricsAsPercent.formatPassRate.toFixed(1)}%
                  </span>
                  {metricsDelta && formatDelta(metricsDelta.formatPassRate)}
                </div>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">유사도 통과</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {metricsAsPercent.semanticPassRate.toFixed(1)}%
                  </span>
                  {metricsDelta && formatDelta(metricsDelta.semanticPassRate)}
                </div>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">제약조건 통과</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {metricsAsPercent.logicPassRate.toFixed(1)}%
                  </span>
                  {metricsDelta && formatDelta(metricsDelta.logicPassRate)}
                </div>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">평균 유사도</p>
                <p className="text-2xl font-bold">
                  {(metricsAsPercent.avgSemantic * 100).toFixed(1)}%
                </p>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="mb-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                전체 ({activeResults.length})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "pass" ? "default" : "outline"}
                onClick={() => setStatusFilter("pass")}
              >
                통과 ({passCount})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "fail" ? "default" : "outline"}
                onClick={() => setStatusFilter("fail")}
              >
                실패 ({failCount})
              </Button>
              {isCompareMode && summary && (
                <>
                  <Button
                    size="sm"
                    variant={statusFilter === "regressed" ? "default" : "outline"}
                    className={statusFilter !== "regressed" ? "border-red-200 text-red-600" : ""}
                    onClick={() => setStatusFilter("regressed")}
                  >
                    회귀 ({summary.regressed})
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === "improved" ? "default" : "outline"}
                    className={statusFilter !== "improved" ? "border-green-200 text-green-600" : ""}
                    onClick={() => setStatusFilter("improved")}
                  >
                    개선 ({summary.improved})
                  </Button>
                </>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex-1 rounded-lg border bg-white">
                <RunResultsTable
                  results={filteredResults}
                  selectedId={selectedResultId}
                  onSelect={setSelectedResultId}
                  compareMode={isCompareMode}
                  rowChanges={rowChanges}
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

        {/* Live Profile Editor Sidebar */}
        {isLiveEditorOpen && (
          <LiveProfileEditor
            run={run}
            onClose={() => setIsLiveEditorOpen(false)}
            onPreviewUpdate={setPreviewResults}
          />
        )}
      </div>
    </div>
  );
};
