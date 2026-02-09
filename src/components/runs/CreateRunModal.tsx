import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRun } from "@/hooks/mutations/useCreateRun";
import { datasetQueries } from "@/queries/datasetQueries";
import { profileQueries } from "@/queries/profileQueries";
import { promptQueries } from "@/queries/promptQueries";
import { useApiKeyByProvider } from "@/stores/apiKeyStore";
import type { CreateRunFormState } from "@/types/run";
import { extractProvider } from "@/utils/provider";

const initialFormState: CreateRunFormState = {
  promptId: null,
  versionId: null,
  datasetId: null,
  profileId: null,
};

interface CreateRunModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateRunModal = ({ open, onOpenChange }: CreateRunModalProps) => {
  const [formState, setFormState] = useState(initialFormState);

  const { data: prompts } = useQuery(promptQueries.list());
  const { data: versions } = useQuery(promptQueries.versions(formState.promptId ?? 0));
  const { data: datasets } = useQuery(datasetQueries.list());
  const { data: profiles } = useQuery(profileQueries.list());

  const createRun = useCreateRun();

  const effectiveVersionId = formState.versionId ?? versions?.[0]?.id ?? null;

  const selectedVersion = versions?.find((v) => v.id === effectiveVersionId);
  const requiredProvider = selectedVersion ? extractProvider(selectedVersion.model) : null;
  const apiKey = useApiKeyByProvider(requiredProvider);

  const handlePromptChange = (value: string) => {
    const promptId = parseInt(value, 10);
    setFormState((prev) => ({
      ...prev,
      promptId,
      versionId: null,
    }));
  };

  const handleVersionChange = (value: string) => {
    setFormState((prev) => ({ ...prev, versionId: parseInt(value, 10) }));
  };

  const handleDatasetChange = (value: string) => {
    setFormState((prev) => ({ ...prev, datasetId: parseInt(value, 10) }));
  };

  const handleProfileChange = (value: string) => {
    setFormState((prev) => ({ ...prev, profileId: parseInt(value, 10) }));
  };

  const isFormValid =
    formState.promptId !== null &&
    effectiveVersionId !== null &&
    formState.datasetId !== null &&
    formState.profileId !== null;

  const handleSubmit = () => {
    if (!isFormValid) return;

    createRun.mutate(
      {
        promptVersionId: effectiveVersionId,
        datasetId: formState.datasetId!,
        profileId: formState.profileId!,
        ...(apiKey && { apiKey }),
      },
      {
        onSuccess: () => {
          toast.success("실행이 시작되었습니다");
          onOpenChange(false);
          setFormState(initialFormState);
        },
        onError: () => {
          toast.error("실행에 실패했습니다");
        },
      },
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormState(initialFormState);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 실행</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>프롬프트</Label>
            <Select value={formState.promptId?.toString() ?? ""} onValueChange={handlePromptChange}>
              <SelectTrigger>
                <SelectValue placeholder="프롬프트 선택" />
              </SelectTrigger>
              <SelectContent>
                {prompts?.map((prompt) => (
                  <SelectItem key={prompt.id} value={prompt.id.toString()}>
                    {prompt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>버전</Label>
            <Select
              value={effectiveVersionId?.toString() ?? ""}
              onValueChange={handleVersionChange}
              disabled={!formState.promptId}
            >
              <SelectTrigger>
                <SelectValue placeholder="버전 선택" />
              </SelectTrigger>
              <SelectContent>
                {versions?.map((version) => (
                  <SelectItem key={version.id} value={version.id.toString()}>
                    v{version.versionNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>데이터셋</Label>
            <Select
              value={formState.datasetId?.toString() ?? ""}
              onValueChange={handleDatasetChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="데이터셋 선택" />
              </SelectTrigger>
              <SelectContent>
                {datasets?.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id.toString()}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>평가 프로필</Label>
            <Select
              value={formState.profileId?.toString() ?? ""}
              onValueChange={handleProfileChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="프로필 선택" />
              </SelectTrigger>
              <SelectContent>
                {profiles?.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id.toString()}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {requiredProvider && !apiKey && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {requiredProvider} API Key가 설정되지 않았습니다. 설정 페이지에서 입력해주세요.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid || createRun.isPending}>
            {createRun.isPending ? "실행 중..." : "실행"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
