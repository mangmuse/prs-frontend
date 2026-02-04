import { useMemo, useState } from "react";

import type { RunDetailData, RunResultRow } from "@/types/runDetail";
import type { MetricsAsPercent } from "@/types/runDetail";

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
  setPreviewResults: (results: RunResultRow[] | null) => void;
  handleToggleLiveEditor: () => void;
  handleCloseLiveEditor: () => void;
}

export const useLiveSimulation = ({ run }: UseLiveSimulationInput): UseLiveSimulationResult => {
  const [isLiveEditorOpen, setIsLiveEditorOpen] = useState(false);
  const [previewResults, setPreviewResults] = useState<RunResultRow[] | null>(null);

  const activeResults = useMemo(() => {
    return isLiveEditorOpen && previewResults ? previewResults : run?.results || [];
  }, [isLiveEditorOpen, previewResults, run?.results]);

  const { passCount, failCount, totalCount } = useMemo(() => {
    const pass = activeResults.filter((r) => r.status === "pass").length;
    return {
      passCount: pass,
      failCount: activeResults.length - pass,
      totalCount: activeResults.length,
    };
  }, [activeResults]);

  const metricsAsPercent = useMemo((): MetricsAsPercent => {
    if (activeResults.length === 0) {
      return {
        passRate: 0,
        formatPassRate: 0,
        semanticPassRate: 0,
        logicPassRate: 0,
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
        logicPassRate: passRate * 100,
        avgSemantic: run?.metrics.avgSemantic ?? 0,
      };
    }

    const metrics = run?.metrics ?? {
      passRate: 0,
      formatPassRate: 0,
      semanticPassRate: 0,
      logicPassRate: 0,
      avgSemantic: 0,
    };

    return {
      passRate: metrics.passRate * 100,
      formatPassRate: metrics.formatPassRate * 100,
      semanticPassRate: metrics.semanticPassRate * 100,
      logicPassRate: metrics.logicPassRate * 100,
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
