import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { FileText, Plus, Trash2 } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { useDeletePrompt } from "@/hooks/mutations/useDeletePrompt";
import { cn } from "@/lib/utils";
import { promptQueries } from "@/queries/promptQueries";

interface PromptListProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreateNew: () => void;
}

export const PromptList = ({ selectedId, onSelect, onCreateNew }: PromptListProps) => {
  const { data: prompts, isPending } = useQuery(promptQueries.list());
  const [deletingPromptId, setDeletingPromptId] = useState<number | null>(null);
  const deletePrompt = useDeletePrompt();

  const handlePromptDelete = () => {
    if (deletingPromptId === null) return;
    deletePrompt.mutate(deletingPromptId, {
      onSuccess: () => setDeletingPromptId(null),
    });
  };

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
                <div className="flex items-center gap-1">
                  {prompt.latestVersion && (
                    <span className="text-xs text-muted-foreground">v{prompt.latestVersion}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    aria-label="삭제"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingPromptId(prompt.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{prompt.versionCount}개 버전</div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDeleteDialog
        open={deletingPromptId !== null}
        onOpenChange={(open) => !open && setDeletingPromptId(null)}
        isPending={deletePrompt.isPending}
        onConfirm={handlePromptDelete}
        title="프롬프트를 삭제하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다. 프롬프트와 모든 버전이 영구적으로 삭제됩니다."
      />
    </div>
  );
};
