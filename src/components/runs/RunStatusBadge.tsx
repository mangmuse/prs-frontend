import { Badge } from "@/components/ui/badge";
import type { RunStatus } from "@/types/run";

const statusConfig: Record<
  RunStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  running: { label: "실행 중", variant: "default" },
  completed: { label: "완료", variant: "secondary" },
  failed: { label: "실패", variant: "destructive" },
};

interface RunStatusBadgeProps {
  status: RunStatus;
}

export const RunStatusBadge = ({ status }: RunStatusBadgeProps) => {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
