import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Settings, Trash2, User } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { EditMetaDialog } from "@/components/common/EditMetaDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeletePrompt } from "@/hooks/mutations/useDeletePrompt";
import { useUpdatePrompt } from "@/hooks/mutations/useUpdatePrompt";
import { cn } from "@/lib/utils";
import { promptQueries } from "@/queries/promptQueries";

interface PromptDetailProps {
  promptId: number;
  promptName: string;
  promptDescription: string | null;
  onCreateVersion: () => void;
  onDelete: () => void;
}

export const PromptDetail = ({
  promptId,
  promptName,
  promptDescription,
  onCreateVersion,
  onDelete,
}: PromptDetailProps) => {
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [contentTab, setContentTab] = useState<"system" | "user">("system");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [isDeletingPrompt, setIsDeletingPrompt] = useState(false);

  const deletePrompt = useDeletePrompt();
  const updatePrompt = useUpdatePrompt();

  const handlePromptDelete = () => {
    deletePrompt.mutate(promptId, {
      onSuccess: () => {
        setIsDeletingPrompt(false);
        onDelete();
      },
    });
  };

  const handlePromptUpdate = (data: { name: string; description: string }) => {
    updatePrompt.mutate({ promptId, data }, { onSuccess: () => setIsEditingPrompt(false) });
  };

  const { data: versions, isPending: versionsLoading } = useQuery(promptQueries.versions(promptId));

  const currentVersionId = selectedVersionId ?? versions?.[0]?.id ?? null;

  const { data: versionDetail, isPending: detailLoading } = useQuery({
    ...promptQueries.versionDetail(promptId, currentVersionId ?? 0),
    enabled: !!currentVersionId,
  });

  if (versionsLoading) {
    return <div className="text-muted-foreground">버전 로딩 중...</div>;
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="mb-4 text-muted-foreground">버전이 없습니다.</p>
        <Button onClick={onCreateVersion}>
          <Plus className="mr-1 h-4 w-4" />첫 버전 생성
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{promptName}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="수정"
            onClick={() => setIsEditingPrompt(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            aria-label="삭제"
            onClick={() => setIsDeletingPrompt(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" onClick={onCreateVersion}>
            <Plus className="mr-1 h-4 w-4" />새 버전
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {versions.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVersionId(v.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm transition-colors",
              currentVersionId === v.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            v{v.versionNumber}
          </button>
        ))}
      </div>

      {detailLoading ? (
        <div className="text-muted-foreground">상세 로딩 중...</div>
      ) : versionDetail ? (
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">모델</span>
              <div className="font-medium">{versionDetail.model}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Temperature</span>
              <div className="font-medium">{versionDetail.temperature}</div>
            </div>
            <div>
              <span className="text-muted-foreground">출력 형식</span>
              <div className="font-medium">{versionDetail.outputSchema}</div>
            </div>
          </div>

          {versionDetail.memo && (
            <div className="rounded bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              📝 {versionDetail.memo}
            </div>
          )}

          <Tabs value={contentTab} onValueChange={(v) => setContentTab(v as "system" | "user")}>
            <TabsList className="w-full">
              <TabsTrigger value="system" className="flex-1 gap-2">
                <Settings className="h-4 w-4" />
                시스템 지시문(System Instruction)
              </TabsTrigger>
              <TabsTrigger value="user" className="flex-1 gap-2">
                <User className="h-4 w-4" />
                사용자 템플릿(User Template)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="system">
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-900 p-4 font-mono text-sm text-zinc-100">
                {versionDetail.systemInstruction || "(비어있음)"}
              </pre>
            </TabsContent>
            <TabsContent value="user">
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-900 p-4 font-mono text-sm text-zinc-100">
                {versionDetail.userTemplate || "(비어있음)"}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}

      <ConfirmDeleteDialog
        open={isDeletingPrompt}
        onOpenChange={(open) => !open && setIsDeletingPrompt(false)}
        isPending={deletePrompt.isPending}
        onConfirm={handlePromptDelete}
        title="프롬프트를 삭제하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다. 프롬프트와 모든 버전이 영구적으로 삭제됩니다."
      />
      <EditMetaDialog
        open={isEditingPrompt}
        onOpenChange={(open) => !open && setIsEditingPrompt(false)}
        onSubmit={handlePromptUpdate}
        isPending={updatePrompt.isPending}
        title="프롬프트 수정"
        initialName={promptName}
        initialDescription={promptDescription ?? ""}
      />
    </div>
  );
};
