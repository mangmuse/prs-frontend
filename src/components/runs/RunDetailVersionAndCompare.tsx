import { X } from "lucide-react";

import { RunVersionTabs } from "@/components/runs/RunVersionTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          <Select onValueChange={onCompareSelect}>
            <SelectTrigger className="h-8 w-[160px] text-sm">
              <SelectValue placeholder="버전 선택" />
            </SelectTrigger>
            <SelectContent>
              {relatedVersions.executedRuns
                .filter((r) => r.id !== runId)
                .map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    v{r.versionNumber}와 비교
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )}
  </div>
);
