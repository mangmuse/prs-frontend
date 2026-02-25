import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Play, Plus } from "lucide-react";
import { toast } from "sonner";

import { CreateRunModal } from "@/components/runs/CreateRunModal";
import { RunsTable } from "@/components/runs/RunsTable";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/modals/useModal";
import { useRunStatusChange } from "@/hooks/useRunStatusChange";
import { runQueries } from "@/queries/runQueries";
import { formatPercent } from "@/utils/format";

const POLLING_INTERVAL = 3000;

export const RunsPage = () => {
  const { state, open, onOpenChange } = useModal();

  const { data: runs = [] } = useQuery({
    ...runQueries.list(),
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasRunning = data?.some((run) => run.status === "running");
      return hasRunning ? POLLING_INTERVAL : false;
    },
  });

  const statusChangeHandlers = useMemo(
    () => ({
      onCompleted: (run: { id: number; passRate: number | null }) => {
        toast.success(`실행 #${run.id} 완료 - 통과율: ${formatPercent(run.passRate)}%`);
      },
      onFailed: (run: { id: number }) => {
        toast.error(`실행 #${run.id} 실패`);
      },
    }),
    [],
  );

  useRunStatusChange(runs, statusChangeHandlers);

  return (
    <div className="flex flex-col h-full">
      <title>PRS | 실행 기록</title>
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-white px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">실행 기록</h1>
        </div>
        <Button onClick={() => open()}>
          <Plus className="w-4 h-4 mr-2" />새 실행
        </Button>
      </header>
      <div className="flex-1 p-6">
        {runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <Play className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">실행 기록이 없습니다</p>
            <Button className="mt-4" onClick={() => open()}>
              <Plus className="mr-2 h-4 w-4" />첫 실행 시작하기
            </Button>
          </div>
        ) : (
          <RunsTable runs={runs} />
        )}
      </div>

      <CreateRunModal open={state.open} onOpenChange={onOpenChange} />
    </div>
  );
};
