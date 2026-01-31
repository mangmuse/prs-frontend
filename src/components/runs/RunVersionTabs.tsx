import { useNavigate } from "react-router";

import { ChevronDown, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RelatedRun, UnexecutedVersion } from "@/types/run";

interface RunVersionTabsProps {
  currentRunId: number;
  currentVersionNumber: number;
  executedRuns: RelatedRun[];
  unexecutedVersions: UnexecutedVersion[];
  onExecuteVersion: (versionId: number) => void;
}

export const RunVersionTabs = ({
  currentRunId,
  currentVersionNumber,
  executedRuns,
  unexecutedVersions,
  onExecuteVersion,
}: RunVersionTabsProps) => {
  const navigate = useNavigate();

  const sortedRuns = [...executedRuns].sort((a, b) => b.versionNumber - a.versionNumber);

  const sortedUnexecuted = [...unexecutedVersions].sort(
    (a, b) => b.versionNumber - a.versionNumber,
  );

  const handleVersionSelect = (runId: number) => {
    if (runId !== currentRunId) {
      void navigate(`/runs/${runId}`);
    }
  };

  const hasOtherVersions = sortedRuns.length > 1 || sortedUnexecuted.length > 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">버전:</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            v{currentVersionNumber}
            {hasOtherVersions && <ChevronDown className="h-3 w-3" />}
          </Button>
        </DropdownMenuTrigger>
        {hasOtherVersions && (
          <DropdownMenuContent align="start" className="min-w-40">
            {sortedRuns.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  실행된 버전
                </div>
                {sortedRuns.map((run) => (
                  <DropdownMenuItem
                    key={run.id}
                    onClick={() => handleVersionSelect(run.id)}
                    className={run.id === currentRunId ? "bg-accent" : ""}
                  >
                    <span className="flex-1">v{run.versionNumber}</span>
                    {run.passRate !== null && (
                      <span className="text-xs text-muted-foreground">
                        {(run.passRate * 100).toFixed(0)}%
                      </span>
                    )}
                    {run.id === currentRunId && (
                      <span className="ml-2 text-xs text-muted-foreground">(현재)</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {sortedUnexecuted.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  미실행 버전
                </div>
                {sortedUnexecuted.map((version) => (
                  <DropdownMenuItem
                    key={version.id}
                    onClick={() => onExecuteVersion(version.id)}
                    className="gap-2"
                  >
                    <Play className="h-3 w-3" />
                    <span>v{version.versionNumber} 실행</span>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      {!hasOtherVersions && (
        <span className="text-xs text-muted-foreground">(v{currentVersionNumber}만 실행됨)</span>
      )}
    </div>
  );
};
