import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Maximize2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { EditMetaDialog } from "@/components/common/EditMetaDialog";
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
import {
  useDeleteDataset,
  useDeleteDatasetRow,
  useUpdateDataset,
} from "@/hooks/mutations/datasetMutations";
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
  onDelete: () => void;
}

const ROWS_PER_PAGE = 10;

export const DatasetTable = ({ datasetId, onDelete }: DatasetTableProps) => {
  const {
    state: rowFormState,
    open: openRowForm,
    onOpenChange: onRowFormOpenChange,
  } = useModal<RowFormState>({ open: false });
  const [page, setPage] = useState<number>(1);
  const [deletingRowId, setDeletingRowId] = useState<number | null>(null);
  const deleteRow = useDeleteDatasetRow();
  const [isDeletingDataset, setIsDeletingDataset] = useState(false);
  const [isEditingDataset, setIsEditingDataset] = useState(false);
  const deleteDataset = useDeleteDataset();
  const updateDataset = useUpdateDataset();

  const { data, isPending, error } = useQuery(
    datasetQueries.detail(datasetId, page, ROWS_PER_PAGE),
  );

  const handleRowDelete = () => {
    if (deletingRowId === null) return;
    deleteRow.mutate(
      { datasetId, rowId: deletingRowId },
      {
        onSuccess: () => {
          toast.success("행이 삭제되었습니다");
          setDeletingRowId(null);
        },
        onError: () => {
          toast.error("행 삭제에 실패했습니다");
        },
      },
    );
  };

  const handleDatasetUpdate = (formData: { name: string; description: string }) => {
    updateDataset.mutate(
      { datasetId, data: formData },
      {
        onSuccess: () => {
          toast.success("데이터셋이 수정되었습니다");
          setIsEditingDataset(false);
        },
        onError: () => {
          toast.error("데이터셋 수정에 실패했습니다");
        },
      },
    );
  };

  const handleDatasetDelete = () => {
    deleteDataset.mutate(datasetId, {
      onSuccess: () => {
        toast.success("데이터셋이 삭제되었습니다");
        setIsDeletingDataset(false);
        onDelete();
      },
      onError: () => {
        toast.error("데이터셋 삭제에 실패했습니다");
      },
    });
  };

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
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">{data.name}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="데이터셋 수정"
            onClick={() => setIsEditingDataset(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            aria-label="데이터셋 삭제"
            onClick={() => setIsDeletingDataset(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
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
                        onClick={() => setDeletingRowId(row.id)}
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

      <ConfirmDeleteDialog
        open={deletingRowId !== null}
        onOpenChange={(open) => !open && setDeletingRowId(null)}
        isPending={deleteRow.isPending}
        onConfirm={handleRowDelete}
        title="행을 삭제하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다. 해당 행이 영구적으로 삭제됩니다."
      />
      <EditMetaDialog
        open={isEditingDataset}
        onOpenChange={(open) => !open && setIsEditingDataset(false)}
        onSubmit={handleDatasetUpdate}
        isPending={updateDataset.isPending}
        title="데이터셋 수정"
        initialName={data.name}
        initialDescription={data.description ?? ""}
      />
      <ConfirmDeleteDialog
        open={isDeletingDataset}
        onOpenChange={(open) => !open && setIsDeletingDataset(false)}
        isPending={deleteDataset.isPending}
        onConfirm={handleDatasetDelete}
        title="데이터셋을 삭제하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다. 데이터셋과 모든 행이 영구적으로 삭제됩니다."
      />
    </div>
  );
};
