import { ArrowLeft, RotateCcw, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const RunDetailHeader = ({
  promptName,
  datasetName,
  versionNumber,
  isLiveEditorOpen,
  isRerunning,
  onBack,
  onRerun,
  onToggleLiveEditor,
}: {
  promptName: string;
  datasetName: string;
  versionNumber: number;
  isLiveEditorOpen: boolean;
  isRerunning: boolean;
  onBack: () => void;
  onRerun: () => void;
  onToggleLiveEditor: () => void;
}) => (
  <header className="flex h-16 items-center gap-4 border-b bg-white px-6 justify-between shrink-0">
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">{promptName}</h1>
        <span className="text-muted-foreground">×</span>
        <span className="text-muted-foreground">{datasetName}</span>
        <Badge variant="outline" className="ml-2">
          v{versionNumber}
        </Badge>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRerun}
        disabled={isRerunning}
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        {isRerunning ? "실행 중..." : "재실행"}
      </Button>
      <Button
        variant={isLiveEditorOpen ? "secondary" : "outline"}
        size="sm"
        onClick={onToggleLiveEditor}
        className="gap-2"
      >
        <Settings2 className="h-4 w-4" />
        {isLiveEditorOpen ? "편집기 닫기" : "평가 기준 튜닝"}
      </Button>
    </div>
  </header>
);
