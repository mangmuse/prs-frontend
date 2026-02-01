import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/PageHeader";
import { CreatePromptModal, type ModalState } from "@/components/prompts/CreatePromptModal";
import { PromptDetail } from "@/components/prompts/PromptDetail";
import { PromptList } from "@/components/prompts/PromptList";
import { useModal } from "@/hooks/modals/useModal";
import { promptQueries } from "@/queries/promptQueries";

export const PromptsPage = () => {
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const {
    state: modalState,
    open: openModal,
    close: closeModal,
  } = useModal<ModalState>({ open: false });

  const { data: prompts } = useQuery(promptQueries.list());
  const selectedPrompt = prompts?.find((p) => p.id === selectedPromptId);

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Prompts" />

      <div className="flex-1 grid grid-cols-3 gap-6 p-6">
        <PromptList
          selectedId={selectedPromptId}
          onSelect={setSelectedPromptId}
          onCreateNew={() => openModal({ mode: "create" })}
        />

        <div className="col-span-2">
          {selectedPromptId && selectedPrompt ? (
            <PromptDetail
              promptId={selectedPromptId}
              promptName={selectedPrompt.name}
              onCreateVersion={() => {
                if (selectedPromptId) {
                  openModal({ mode: "version", promptId: selectedPromptId });
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <p className="text-muted-foreground">프롬프트를 선택하세요</p>
            </div>
          )}
        </div>
      </div>

      <CreatePromptModal state={modalState} onClose={closeModal} />
    </div>
  );
};
