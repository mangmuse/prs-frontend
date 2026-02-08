import type { ComponentType } from "react";
import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

import { runQueries } from "@/queries/runQueries";
import type { RegressionSummary, RowChange } from "@/types/regression";
import type { RunDetailData, RunResultRow } from "@/types/runDetail";
import type { MetricsDelta } from "@/types/runDetail";
import { calculateSummary, classifyCategory } from "@/utils/regression";

export type StatsMessage = {
  icon: ComponentType<{ className?: string }>;
  color: string;
  title: string;
  description: string;
};

interface UseCompareModeInput {
  runId: number;
  run: RunDetailData | undefined;
  previewResults: RunResultRow[] | null;
}

interface UseCompareModeResult {
  isCompareMode: boolean;
  compareTargetId: number | null;
  compareTargetVersionNumber: number | undefined;
  rowChanges: Map<number, RowChange>;
  summary: RegressionSummary | undefined;
  metricsDelta: MetricsDelta | undefined;
  stats: StatsMessage | null;
  getBaseResult: (datasetRowId: number) => RunResultRow | undefined;
  handleCompareSelect: (targetId: string) => void;
  handleCancelCompare: () => void;
}

const formatPValue = (pValue: number): string => {
  if (pValue < 0.001) return "< 0.001";
  return pValue.toFixed(3);
};

const getStatisticsMessage = (pValue: number): StatsMessage => {
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

export const useCompareMode = ({
  runId,
  run,
  previewResults,
}: UseCompareModeInput): UseCompareModeResult => {
  const [compareTargetId, setCompareTargetId] = useState<number | null>(null);

  const { data: comparisonData } = useQuery({
    ...runQueries.comparison(compareTargetId!, runId),
    enabled: compareTargetId !== null,
  });

  const { data: baseRun } = useQuery({
    ...runQueries.detail(compareTargetId!),
    enabled: compareTargetId !== null,
  });

  const { data: relatedVersions } = useQuery(runQueries.relatedVersions(runId));

  const isCompareMode = compareTargetId !== null;
  const compareTarget = relatedVersions?.executedRuns.find((r) => r.id === compareTargetId);

  const { rowChanges, summary } = useMemo(() => {
    if (!comparisonData) {
      return { rowChanges: new Map(), summary: undefined };
    }

    const effectiveComparisons = comparisonData.rowComparisons.map((r) => {
      if (previewResults) {
        const simulated = previewResults.find((p) => p.rowIndex === r.rowIndex);
        return { ...r, targetStatus: simulated?.status ?? r.targetStatus };
      }
      return r;
    });

    const changes = new Map(
      effectiveComparisons.map((r) => [
        r.rowIndex,
        {
          category: classifyCategory(r.baseStatus, r.targetStatus),
          baseStatus: r.baseStatus,
          targetStatus: r.targetStatus,
        },
      ]),
    );

    return {
      rowChanges: changes,
      summary: calculateSummary(effectiveComparisons),
    };
  }, [comparisonData, previewResults]);

  const metricsDelta = useMemo((): MetricsDelta | undefined => {
    if (!run || !baseRun) return undefined;

    return {
      passRate: run.metrics.passRate - baseRun.metrics.passRate,
      formatPassRate: run.metrics.formatPassRate - baseRun.metrics.formatPassRate,
      semanticPassRate: run.metrics.semanticPassRate - baseRun.metrics.semanticPassRate,
      constraintPassRate: run.metrics.constraintPassRate - baseRun.metrics.constraintPassRate,
    };
  }, [run, baseRun]);

  const stats = comparisonData ? getStatisticsMessage(comparisonData.pValue) : null;

  const handleCompareSelect = (targetId: string) => {
    if (targetId) {
      setCompareTargetId(Number(targetId));
    }
  };

  const handleCancelCompare = () => {
    setCompareTargetId(null);
  };

  const getBaseResult = (datasetRowId: number): RunResultRow | undefined => {
    return baseRun?.results.find((r) => r.datasetRowId === datasetRowId);
  };

  return {
    isCompareMode,
    compareTargetId,
    compareTargetVersionNumber: compareTarget?.versionNumber,
    rowChanges,
    summary,
    metricsDelta,
    stats,
    getBaseResult,
    handleCompareSelect,
    handleCancelCompare,
  };
};
