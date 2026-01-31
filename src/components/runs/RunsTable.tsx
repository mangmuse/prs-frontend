import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RunSummary } from "@/types/run";
import { formatRelativeTime } from "@/utils/date";
import { formatPercent } from "@/utils/format";

import { RunStatusBadge } from "./RunStatusBadge";

interface RunsTableProps {
  runs: RunSummary[];
}

export const RunsTable = ({ runs }: RunsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Prompt</TableHead>
          <TableHead>Dataset</TableHead>
          <TableHead>Profile</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>Pass Rate</TableHead>
          <TableHead>Avg Semantic</TableHead>
          <TableHead>날짜</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((run) => (
          <TableRow key={run.id}>
            <TableCell>
              {run.prompt_name} v{run.version_number}
            </TableCell>
            <TableCell>{run.dataset_name}</TableCell>
            <TableCell>{run.profile_name}</TableCell>
            <TableCell>
              <RunStatusBadge status={run.status} />
            </TableCell>
            <TableCell>{formatPercent(run.pass_rate)}</TableCell>
            <TableCell>{formatPercent(run.avg_semantic)}</TableCell>
            <TableCell>{formatRelativeTime(run.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
