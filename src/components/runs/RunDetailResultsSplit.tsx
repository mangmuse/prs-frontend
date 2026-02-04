import { RunResultDetailPanel } from "@/components/runs/RunResultDetailPanel";
import { RunResultsTable } from "@/components/runs/RunResultsTable";
import type { RowChange } from "@/types/regression";
import type { RunResultRow } from "@/types/runDetail";

export const RunDetailResultsSplit = ({
  filteredResults,
  selectedId,
  onSelect,
  isCompareMode,
  rowChanges,
  selectedResult,
}: {
  filteredResults: RunResultRow[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isCompareMode: boolean;
  rowChanges?: Map<number, RowChange>;
  selectedResult?: RunResultRow;
}) => (
  <div className="flex gap-4">
    <div className="flex-1 rounded-lg border bg-white">
      <RunResultsTable
        results={filteredResults}
        selectedId={selectedId}
        onSelect={onSelect}
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
);
