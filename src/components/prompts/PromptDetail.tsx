import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Plus, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { promptQueries } from "@/queries/promptQueries";

interface PromptDetailProps {
  promptId: number;
  promptName: string;
  onCreateVersion: () => void;
}

export const PromptDetail = ({ promptId, promptName, onCreateVersion }: PromptDetailProps) => {
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [contentTab, setContentTab] = useState<"system" | "user">("system");

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
        <Button size="sm" onClick={onCreateVersion}>
          <Plus className="mr-1 h-4 w-4" />새 버전
        </Button>
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
                System Instruction
              </TabsTrigger>
              <TabsTrigger value="user" className="flex-1 gap-2">
                <User className="h-4 w-4" />
                User Template
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
    </div>
  );
};
