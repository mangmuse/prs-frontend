import { useMemo, useState } from "react";

import type {
  MetricsAsPercent,
  ReEvaluatedRow,
  RunDetailData,
  RunResultRow,
  StatusCounts,
} from "@/types/runDetail";

interface UseLiveSimulationInput {
  run: RunDetailData | undefined;
}

interface UseLiveSimulationResult {
  isLiveEditorOpen: boolean;
  previewResults: RunResultRow[] | null;
  activeResults: RunResultRow[];
  metricsAsPercent: MetricsAsPercent;
  passCount: number;
  failCount: number;
  totalCount: number;
  setPreviewResults: (
    results: RunResultRow[] | null,
    statusCounts?: StatusCounts | null,
    reEvaluatedRows?: ReEvaluatedRow[] | null,
  ) => void;
  handleToggleLiveEditor: () => void;
  handleCloseLiveEditor: () => void;
}

export const useLiveSimulation = ({ run }: UseLiveSimulationInput): UseLiveSimulationResult => {
  const [isLiveEditorOpen, setIsLiveEditorOpen] = useState(false);
  const [previewResults, setPreviewResultsState] = useState<RunResultRow[] | null>(null);
  const [previewStatusCounts, setPreviewStatusCounts] = useState<StatusCounts | null>(null);
  const [previewStatusMap, setPreviewStatusMap] = useState<Map<
    number,
    RunResultRow["status"]
  > | null>(null);

  const setPreviewResults = (
    results: RunResultRow[] | null,
    statusCounts?: StatusCounts | null,
    reEvaluatedRows?: ReEvaluatedRow[] | null,
  ) => {
    setPreviewResultsState(results);
    setPreviewStatusCounts(statusCounts ?? null);
    if (reEvaluatedRows) {
      setPreviewStatusMap(new Map(reEvaluatedRows.map((row) => [row.id, row.status])));
      return;
    }
    setPreviewStatusMap(null);
  };

  const activeResults = useMemo(() => {
    if (isLiveEditorOpen && previewResults) {
      if (previewStatusMap) {
        const baseRows = run?.results || [];
        return baseRows.map((row) => {
          const updatedStatus = previewStatusMap.get(row.id);
          if (!updatedStatus) return row;
          return { ...row, status: updatedStatus };
        });
      }
      return previewResults;
    }
    return run?.results || [];
  }, [isLiveEditorOpen, previewResults, previewStatusMap, run?.results]);

  const { passCount, failCount, totalCount } = useMemo(() => {
    if (isLiveEditorOpen && previewResults) {
      if (previewStatusCounts && run?.totalCount !== null) {
        const pass = previewStatusCounts.pass ?? 0;
        return {
          passCount: pass,
          failCount: run.totalCount - pass,
          totalCount: run.totalCount,
        };
      }

      const pass = activeResults.filter((r) => r.status === "pass").length;
      return {
        passCount: pass,
        failCount: activeResults.length - pass,
        totalCount: activeResults.length,
      };
    }

    if (run?.statusCounts && run.totalCount !== null) {
      const pass = run.statusCounts.pass ?? 0;
      return {
        passCount: pass,
        failCount: run.totalCount - pass,
        totalCount: run.totalCount,
      };
    }

    const pass = activeResults.filter((r) => r.status === "pass").length;
    return {
      passCount: pass,
      failCount: activeResults.length - pass,
      totalCount: activeResults.length,
    };
  }, [activeResults, isLiveEditorOpen, previewResults, previewStatusCounts, run]);

  const metricsAsPercent = useMemo((): MetricsAsPercent => {
    if (activeResults.length === 0) {
      return {
        passRate: 0,
        formatPassRate: 0,
        semanticPassRate: 0,
        constraintPassRate: 0,
        avgSemantic: 0,
      };
    }

    if (isLiveEditorOpen && previewResults) {
      const formatPassRate =
        activeResults.filter((r) => r.status !== "format").length / activeResults.length;
      const semanticPassRate =
        activeResults.filter((r) => r.status !== "format" && r.status !== "semantic").length /
        activeResults.length;
      const passRate = passCount / activeResults.length;

      return {
        passRate: passRate * 100,
        formatPassRate: formatPassRate * 100,
        semanticPassRate: semanticPassRate * 100,
        constraintPassRate: passRate * 100,
        avgSemantic: run?.metrics.avgSemantic ?? 0,
      };
    }

    const metrics = run?.metrics ?? {
      passRate: 0,
      formatPassRate: 0,
      semanticPassRate: 0,
      constraintPassRate: 0,
      avgSemantic: 0,
    };

    return {
      passRate: metrics.passRate * 100,
      formatPassRate: metrics.formatPassRate * 100,
      semanticPassRate: metrics.semanticPassRate * 100,
      constraintPassRate: metrics.constraintPassRate * 100,
      avgSemantic: metrics.avgSemantic,
    };
  }, [activeResults, isLiveEditorOpen, previewResults, passCount, run?.metrics]);

  const handleToggleLiveEditor = () => {
    if (isLiveEditorOpen) {
      setIsLiveEditorOpen(false);
      setPreviewResults(null);
    } else {
      setIsLiveEditorOpen(true);
    }
  };

  const handleCloseLiveEditor = () => {
    setIsLiveEditorOpen(false);
  };

  return {
    isLiveEditorOpen,
    previewResults,
    activeResults,
    metricsAsPercent,
    passCount,
    failCount,
    totalCount,
    setPreviewResults,
    handleToggleLiveEditor,
    handleCloseLiveEditor,
  };
};
