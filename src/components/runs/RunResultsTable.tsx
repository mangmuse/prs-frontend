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

interface RunResultsTableProps {
  results: RunResultRow[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const STATUS_CONFIG = {
  pass: { label: "Pass", className: "bg-green-100 text-green-800 border-green-200" },
  format: { label: "Format", className: "bg-orange-100 text-orange-800 border-orange-200" },
  semantic: { label: "Semantic", className: "bg-purple-100 text-purple-800 border-purple-200" },
  logic: { label: "Logic", className: "bg-red-100 text-red-800 border-red-200" },
} as const;

export const RunResultsTable = ({ results, selectedId, onSelect }: RunResultsTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-10">#</TableHead>
        <TableHead>Input</TableHead>
        <TableHead className="w-20 text-center">상태</TableHead>
        <TableHead className="w-16 text-center">Format</TableHead>
        <TableHead className="w-20 text-center">Semantic</TableHead>
        <TableHead className="w-14 text-center">Logic</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {results.map((result) => {
        const config = STATUS_CONFIG[result.status];
        const semanticStatus = getLayerStatus(result, "semantic");
        const logicStatus = getLayerStatus(result, "logic");

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
