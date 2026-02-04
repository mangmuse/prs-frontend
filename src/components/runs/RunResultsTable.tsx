import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RunResultRow } from "@/types/runDetail";
import { getLayerStatus, isSemanticPassed } from "@/utils/evaluation";

import { InputPreview } from "./InputPreview";
import { LayerStatusIcon } from "./LayerStatusIcon";

interface RowChange {
  category: "regressed" | "improved" | "changed" | "unchanged";
  baseStatus: string;
  targetStatus: string;
}

interface RunResultsTableProps {
  results: RunResultRow[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  compareMode?: boolean;
  rowChanges?: Map<number, RowChange>;
}

const STATUS_CONFIG = {
  pass: {
    label: "통과",
    className: "bg-green-100 text-green-800 border-green-200 whitespace-nowrap",
  },
  format: {
    label: "출력형식",
    className: "bg-orange-100 text-orange-800 border-orange-200 whitespace-nowrap",
  },
  semantic: {
    label: "유사도",
    className: "bg-purple-100 text-purple-800 border-purple-200 whitespace-nowrap",
  },
  constraint: {
    label: "제약조건",
    className: "bg-red-100 text-red-800 border-red-200 whitespace-nowrap",
  },
} as const;

const CATEGORY_BADGE = {
  regressed: { label: "회귀", className: "bg-red-100 text-red-700 border-red-200" },
  improved: { label: "개선", className: "bg-green-100 text-green-700 border-green-200" },
  changed: { label: "변경", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  unchanged: { label: "", className: "" },
};

export const RunResultsTable = ({
  results,
  selectedId,
  onSelect,
  compareMode = false,
  rowChanges,
}: RunResultsTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-10">#</TableHead>
        <TableHead>입력값</TableHead>
        <TableHead className="w-20 text-center">상태</TableHead>
        {compareMode && <TableHead className="w-24 text-center">변화</TableHead>}
        <TableHead className="w-24 text-center">출력형식</TableHead>
        <TableHead className="w-20 text-center">유사도</TableHead>
        <TableHead className="w-24 text-center">제약조건</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {results.map((result) => {
        const config = STATUS_CONFIG[result.status];
        const semanticStatus = getLayerStatus(result, "semantic");
        const logicStatus = getLayerStatus(result, "constraint");
        const rowChange = rowChanges?.get(result.rowIndex);

        return (
          <TableRow
            key={result.id}
            className={`cursor-pointer transition-colors ${
              result.id === selectedId ? "bg-blue-50" : "hover:bg-muted/50"
            }`}
            onClick={() => onSelect(result.id)}
          >
            <TableCell className="text-muted-foreground">{result.rowIndex}</TableCell>
            <TableCell>
              <InputPreview input={result.inputSnapshot as Record<string, string>} />
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="outline" className={config.className}>
                {config.label}
              </Badge>
            </TableCell>
            {compareMode && (
              <TableCell className="text-center">
                {rowChange && rowChange.category !== "unchanged" ? (
                  <div className="flex items-center justify-center gap-1">
                    <Badge
                      variant="outline"
                      className={CATEGORY_BADGE[rowChange.category].className}
                    >
                      {CATEGORY_BADGE[rowChange.category].label}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            )}
            <TableCell className="text-center">
              <LayerStatusIcon status={result.isFormatPassed ? "pass" : "fail"} />
            </TableCell>
            <TableCell className="text-center">
              {semanticStatus === "skipped" ? (
                <LayerStatusIcon status="skipped" />
              ) : (
                <span
                  className={`font-mono text-sm ${
                    isSemanticPassed(result) ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {(result.semanticScore * 100).toFixed(0)}%
                </span>
              )}
            </TableCell>
            <TableCell className="text-center">
              <LayerStatusIcon status={logicStatus} />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);
