import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { RunResultDetailPanel } from "@/components/runs/RunResultDetailPanel";
import { RunResultsTable } from "@/components/runs/RunResultsTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RowChange } from "@/types/regression";
import type { RunResultRow } from "@/types/runDetail";

export const RunDetailResultsSplit = ({
  filteredResults,
  selectedId,
  onSelect,
  isCompareMode,
  rowChanges,
  selectedResult,
  baseResult,
}: {
  filteredResults: RunResultRow[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  isCompareMode: boolean;
  rowChanges: Map<number, RowChange>;
  selectedResult: RunResultRow | undefined;
  baseResult: RunResultRow | undefined;
}) => {
  const currentIndex =
    selectedId === null ? -1 : filteredResults.findIndex((r) => r.id === selectedId);
  const isInFilteredList = currentIndex >= 0;
  const prevId =
    isInFilteredList && currentIndex > 0 ? (filteredResults[currentIndex - 1]?.id ?? null) : null;
  const nextId =
    isInFilteredList && currentIndex < filteredResults.length - 1
      ? (filteredResults[currentIndex + 1]?.id ?? null)
      : null;
  const hasPrev = prevId !== null;
  const hasNext = nextId !== null;
  const isCompareSplit = isCompareMode && baseResult !== undefined;

  return (
    <div className="flex gap-4">
      <div
        className={cn(
          "flex-1 rounded-lg border bg-white",
          selectedResult && (isCompareSplit ? "hidden" : "hidden min-[1600px]:block"),
        )}
      >
        <RunResultsTable
          results={filteredResults}
          selectedId={selectedId}
          onSelect={onSelect}
          compareMode={isCompareMode}
          rowChanges={rowChanges}
        />
      </div>

      {selectedResult && (
        <div
          className={cn("w-full", !isCompareSplit && "min-[1600px]:w-100 min-[1600px]:shrink-0")}
        >
          <div
            className={cn(
              "mb-3 flex items-center justify-between",
              !isCompareSplit && "min-[1600px]:hidden",
            )}
          >
            <Button variant="ghost" size="sm" onClick={() => onSelect(null)}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              목록으로
            </Button>
            {isInFilteredList && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {filteredResults.length}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={!hasPrev}
                  onClick={() => prevId !== null && onSelect(prevId)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={!hasNext}
                  onClick={() => nextId !== null && onSelect(nextId)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <RunResultDetailPanel result={selectedResult} baseResult={baseResult} />
        </div>
      )}
    </div>
  );
};
