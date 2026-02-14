import { useState } from "react";
import { useNavigate } from "react-router";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteRun } from "@/hooks/mutations/runMutations";
import type { RunSummary } from "@/types/run";
import { formatRelativeTime } from "@/utils/date";
import { formatPercent } from "@/utils/format";

import { RunStatusBadge } from "./RunStatusBadge";

interface RunsTableProps {
  runs: RunSummary[];
}

export const RunsTable = ({ runs }: RunsTableProps) => {
  const navigate = useNavigate();
  const [deletingRunId, setDeletingRunId] = useState<number | null>(null);
  const deleteRun = useDeleteRun();

  const handleRunDelete = () => {
    if (deletingRunId === null) return;
    deleteRun.mutate(deletingRunId, {
      onSuccess: () => {
        toast.success("실행 기록이 삭제되었습니다");
        setDeletingRunId(null);
      },
      onError: () => {
        toast.error("실행 기록 삭제에 실패했습니다");
      },
    });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>프롬프트</TableHead>
            <TableHead>데이터셋</TableHead>
            <TableHead>프로필</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>통과율</TableHead>
            <TableHead>평균 유사도</TableHead>
            <TableHead>날짜</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => (
            <TableRow
              key={run.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => void navigate(`/runs/${run.id}`)}
            >
              <TableCell>
                {run.promptName} v{run.versionNumber}
              </TableCell>
              <TableCell>{run.datasetName}</TableCell>
              <TableCell>{run.profileName}</TableCell>
              <TableCell>
                <RunStatusBadge status={run.status} />
              </TableCell>
              <TableCell>{formatPercent(run.passRate)}%</TableCell>
              <TableCell>{formatPercent(run.avgSemantic)}%</TableCell>
              <TableCell>{formatRelativeTime(run.createdAt)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="삭제"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingRunId(run.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDeleteDialog
        open={deletingRunId !== null}
        onOpenChange={(open) => !open && setDeletingRunId(null)}
        isPending={deleteRun.isPending}
        onConfirm={handleRunDelete}
        title="실행 기록을 삭제하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다. 실행 기록과 모든 결과가 영구적으로 삭제됩니다."
      />
    </>
  );
};
