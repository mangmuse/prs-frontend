import { X } from "lucide-react";

import { RunVersionTabs } from "@/components/runs/RunVersionTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RelatedVersionsResponse } from "@/types/run";

export const RunDetailVersionAndCompare = ({
  runId,
  runVersionNumber,
  relatedVersions,
  compareTargetVersionNumber,
  isCompareMode,
  onExecuteVersion,
  onCompareSelect,
  onCancelCompare,
}: {
  runId: number;
  runVersionNumber: number;
  relatedVersions?: RelatedVersionsResponse;
  compareTargetVersionNumber?: number;
  isCompareMode: boolean;
  onExecuteVersion: (versionId: number) => void;
  onCompareSelect: (targetId: string) => void;
  onCancelCompare: () => void;
}) => (
  <div className="flex items-center justify-between">
    {relatedVersions && (
      <RunVersionTabs
        currentRunId={runId}
        currentVersionNumber={runVersionNumber}
        executedRuns={relatedVersions.executedRuns}
        unexecutedVersions={relatedVersions.unexecutedVersions}
        onExecuteVersion={onExecuteVersion}
      />
    )}

    {relatedVersions && relatedVersions.executedRuns.length > 1 && (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">비교:</span>
        {isCompareMode ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              v{runVersionNumber} vs v{compareTargetVersionNumber}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onCancelCompare}>
              <X className="h-4 w-4" />
              취소
            </Button>
          </div>
        ) : (
          <select
            className="rounded-md border px-3 py-1.5 text-sm"
            onChange={(e) => onCompareSelect(e.target.value)}
            value=""
          >
            <option value="" disabled>
              버전 선택
            </option>
            {relatedVersions.executedRuns
              .filter((r) => r.id !== runId)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  v{r.versionNumber}와 비교
                </option>
              ))}
          </select>
        )}
      </div>
    )}
  </div>
);
