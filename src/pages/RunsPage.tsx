import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { MobileSidebar } from "@/components/layout/MobileSidebar";
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
        toast.success(`Run #${run.id} 완료 - Pass Rate: ${formatPercent(run.passRate)}%`);
      },
      onFailed: (run: { id: number }) => {
        toast.error(`Run #${run.id} 실패`);
      },
    }),
    [],
  );

  useRunStatusChange(runs, statusChangeHandlers);

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-white px-6">
        <div className="flex items-center gap-4">
          <MobileSidebar />
          <h1 className="text-xl font-semibold">Runs</h1>
        </div>
        <Button onClick={() => open()}>
          <Plus className="w-4 h-4 mr-2" />새 Run 실행
        </Button>
      </header>
      <div className="flex-1 p-6">
        <RunsTable runs={runs} />
      </div>

      <CreateRunModal open={state.open} onOpenChange={onOpenChange} />
    </div>
  );
};
