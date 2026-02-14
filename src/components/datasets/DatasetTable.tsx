import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Maximize2, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useModal } from "@/hooks/modals/useModal";
import { datasetQueries } from "@/queries/datasetQueries";
import type { DatasetRow } from "@/types/dataset";
import { isJsonString } from "@/utils/json";

import { DatasetPagination } from "./DatasetPagination";
import { DatasetRowDetailViewer } from "./DatasetRowDetailViewer";
import { DatasetRowForm } from "./DatasetRowForm";

type RowFormState =
  | { open: false }
  | { open: true; mode: "add" }
  | { open: true; mode: "edit"; row: DatasetRow };

interface DatasetTableProps {
  datasetId: number;
}

const ROWS_PER_PAGE = 10;

export const DatasetTable = ({ datasetId }: DatasetTableProps) => {
  const {
    state: rowFormState,
    open: openRowForm,
    onOpenChange: onRowFormOpenChange,
  } = useModal<RowFormState>({ open: false });
  const [page, setPage] = useState<number>(1);

  const { data, isPending, error } = useQuery(
    datasetQueries.detail(datasetId, page, ROWS_PER_PAGE),
  );

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">로딩 중...</div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-destructive">
        데이터를 불러오는데 실패했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{data.name}</h3>
        <Button onClick={() => openRowForm({ mode: "add" })}>
          <Plus className="mr-2 h-4 w-4" />행 추가
        </Button>
      </div>

      {data.rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">아직 행이 없습니다.</p>
          <Button variant="link" className="mt-2" onClick={() => openRowForm({ mode: "add" })}>
            첫 번째 행 추가하기
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>입력값</TableHead>
                <TableHead className="w-28">기대값</TableHead>
                <TableHead className="w-40">태그</TableHead>
                <TableHead className="w-20">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {(page - 1) * ROWS_PER_PAGE + index + 1}
                  </TableCell>
                  <TableCell>
                    <DatasetRowDetailViewer
                      row={row}
                      defaultTab="input"
                      trigger={
                        <div className="group relative cursor-pointer">
                          <code className="block max-w-md truncate rounded bg-muted px-2 py-1 text-xs transition-colors group-hover:bg-muted/80">
                            {JSON.stringify(row.inputData)}
                          </code>
                          <Maximize2 className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {isJsonString(row.expectedOutput) ? (
                      <DatasetRowDetailViewer
                        row={row}
                        defaultTab="expected"
                        trigger={
                          <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs">
                            JSON <Maximize2 className="h-3 w-3" />
                          </Button>
                        }
                      />
                    ) : (
                      <Badge
                        variant={
                          row.expectedOutput === "TRUE"
                            ? "default"
                            : row.expectedOutput === "FALSE"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {row.expectedOutput}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openRowForm({ mode: "edit", row })}
                        aria-label="수정"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        aria-label="삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {data.pagination.totalPages > 1 && (
        <DatasetPagination
          page={page}
          totalPages={data.pagination.totalPages}
          totalCount={data.pagination.totalCount}
          onPageChange={setPage}
        />
      )}

      <DatasetRowForm
        datasetId={datasetId}
        open={rowFormState.open}
        onOpenChange={onRowFormOpenChange}
        editingRow={
          rowFormState.open && rowFormState.mode === "edit" ? rowFormState.row : undefined
        }
      />
    </div>
  );
};
