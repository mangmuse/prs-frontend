import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/PageHeader";
import { CreatePromptModal } from "@/components/prompts/CreatePromptModal";
import { CreateVersionModal } from "@/components/prompts/CreateVersionModal";
import { PromptDetail } from "@/components/prompts/PromptDetail";
import { PromptList } from "@/components/prompts/PromptList";
import { useModal } from "@/hooks/modals/useModal";
import { promptQueries } from "@/queries/promptQueries";

export const PromptsPage = () => {
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);

  const promptModal = useModal();
  const versionModal = useModal<{ open: boolean; promptId: number }>({
    open: false,
    promptId: 0,
  });

  const { data: prompts } = useQuery(promptQueries.list());
  const selectedPrompt = prompts?.find((p) => p.id === selectedPromptId);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Prompts" />

      <div className="flex-1 grid grid-cols-3 gap-6 p-6">
        <PromptList
          selectedId={selectedPromptId}
          onSelect={setSelectedPromptId}
          onCreateNew={() => promptModal.open()}
        />

        <div className="col-span-2">
          {selectedPromptId && selectedPrompt ? (
            <PromptDetail
              promptId={selectedPromptId}
              promptName={selectedPrompt.name}
              onCreateVersion={() => versionModal.open({ promptId: selectedPromptId })}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <p className="text-muted-foreground">프롬프트를 선택하세요</p>
            </div>
          )}
        </div>
      </div>

      <CreatePromptModal open={promptModal.state.open} onClose={promptModal.close} />

      {versionModal.state.promptId > 0 && (
        <CreateVersionModal
          open={versionModal.state.open}
          promptId={versionModal.state.promptId}
          onClose={versionModal.close}
        />
      )}
    </div>
  );
};
