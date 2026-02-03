import { useNavigate } from "react-router";

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
  const navigate = useNavigate();

  return (
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
