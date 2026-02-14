import { useQuery } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { promptQueries } from "@/queries/promptQueries";

interface PromptListProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreateNew: () => void;
}

export const PromptList = ({ selectedId, onSelect, onCreateNew }: PromptListProps) => {
  const { data: prompts, isPending } = useQuery(promptQueries.list());

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">프롬프트</h2>
        </div>
        <div className="text-sm text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">프롬프트</h2>
        <Button size="sm" onClick={onCreateNew}>
          <Plus className="mr-1 h-4 w-4" />새 프롬프트
        </Button>
      </div>

      {!prompts || prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">프롬프트를 생성하세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              onClick={() => onSelect(prompt.id)}
              className={cn(
                "cursor-pointer rounded-lg border p-4 transition-all hover:border-primary/50",
                selectedId === prompt.id && "border-primary bg-primary/5",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{prompt.name}</span>
                {prompt.latestVersion && (
                  <span className="text-xs text-muted-foreground">v{prompt.latestVersion}</span>
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{prompt.versionCount}개 버전</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
