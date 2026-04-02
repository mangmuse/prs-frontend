import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useCreateVersion } from "@/hooks/mutations/promptMutations";
import type { CreateVersionRequest, OutputSchemaType } from "@/types/prompt";

import { VersionFormFields } from "./VersionFormFields";
import { versionFormDefaults, versionFormSchema } from "./versionFormSchema";
import type { VersionFormData } from "./versionFormSchema";

export interface PrefillData {
  model: string;
  temperature: number;
  outputSchema: OutputSchemaType;
  systemInstruction: string;
  userTemplate: string;
}

interface CreateVersionModalProps {
  open: boolean;
  promptId: number;
  onClose: () => void;
  prefillData?: PrefillData;
}

export const CreateVersionModal = ({
  open,
  promptId,
  onClose,
  prefillData,
}: CreateVersionModalProps) => {
  const form = useForm<VersionFormData>({
    resolver: zodResolver(versionFormSchema),
    defaultValues: {
      ...versionFormDefaults,
      ...(prefillData && {
        systemInstruction: prefillData.systemInstruction,
        userTemplate: prefillData.userTemplate,
        model: prefillData.model,
        temperature: prefillData.temperature,
        outputSchema: prefillData.outputSchema,
      }),
    },
  });

  const createVersionMutation = useCreateVersion();

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: VersionFormData) => {
    const requestData: CreateVersionRequest = {
      systemInstruction: data.systemInstruction,
      userTemplate: data.userTemplate,
      model: data.model,
      temperature: data.temperature,
      outputSchema: data.outputSchema as OutputSchemaType,
      memo: data.memo || undefined,
    };

    createVersionMutation.mutate(
      { promptId, data: requestData },
      {
        onSuccess: () => {
          toast.success("새 버전이 생성되었습니다");
          handleClose();
        },
        onError: () => {
          toast.error("버전 생성에 실패했습니다");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 버전 생성</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-4 py-4">
            <VersionFormFields control={form.control} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button type="submit" disabled={createVersionMutation.isPending}>
                {createVersionMutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
