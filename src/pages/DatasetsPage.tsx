import { useState } from "react";

import { Plus } from "lucide-react";

import { CreateDatasetModal, DatasetSelector, DatasetTable } from "@/components/datasets";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/modals/useModal";

export const DatasetsPage = () => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const { state, open, onOpenChange } = useModal();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Datasets" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <DatasetSelector selectedId={selectedDatasetId} onSelect={setSelectedDatasetId} />
          <Button onClick={() => open()}>
            <Plus className="mr-2 h-4 w-4" />새 데이터셋
          </Button>
        </div>

        {selectedDatasetId ? (
          <DatasetTable datasetId={selectedDatasetId} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <p className="text-muted-foreground">데이터셋을 선택하거나 새로 생성하세요.</p>
          </div>
        )}
      </div>

      <CreateDatasetModal
        open={state.open}
        onOpenChange={onOpenChange}
        onSuccess={() => {
          // 새로 생성된 데이터셋 자동 선택 (optional)
        }}
      />
    </div>
  );
};
