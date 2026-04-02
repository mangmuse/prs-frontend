import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreatePrompt, useCreateVersion } from "@/hooks/mutations/promptMutations";
import type { CreateVersionRequest, OutputSchemaType } from "@/types/prompt";

import { VersionFormFields } from "./VersionFormFields";
import { versionFormDefaults, versionFormSchema } from "./versionFormSchema";

interface CreatePromptModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (id: number) => void;
}

const createPromptWithVersionSchema = z
  .object({
    name: z.string().min(1, "프롬프트 이름을 입력하세요"),
  })
  .merge(versionFormSchema);

type CreatePromptWithVersionFormData = z.infer<typeof createPromptWithVersionSchema>;

export const CreatePromptModal = ({ open, onClose, onCreated }: CreatePromptModalProps) => {
  const form = useForm<CreatePromptWithVersionFormData>({
    resolver: zodResolver(createPromptWithVersionSchema),
    defaultValues: {
      name: "",
      ...versionFormDefaults,
    },
  });

  const createPromptMutation = useCreatePrompt();
  const createVersionMutation = useCreateVersion();

  const isPending = createPromptMutation.isPending || createVersionMutation.isPending;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: CreatePromptWithVersionFormData) => {
    createPromptMutation.mutate(
      { name: data.name },
      {
        onSuccess: (created) => {
          const versionData: CreateVersionRequest = {
            systemInstruction: data.systemInstruction,
            userTemplate: data.userTemplate,
            model: data.model,
            temperature: data.temperature,
            outputSchema: data.outputSchema as OutputSchemaType,
            memo: data.memo || undefined,
          };

          createVersionMutation.mutate(
            { promptId: created.id, data: versionData },
            {
              onSuccess: () => {
                toast.success("프롬프트와 첫 번째 버전이 생성되었습니다");
                onCreated(created.id);
                handleClose();
              },
              onError: () => {
                toast.error("버전 생성에 실패했습니다. 프롬프트는 생성되었습니다.");
                onCreated(created.id);
                handleClose();
              },
            },
          );
        },
        onError: () => {
          toast.error("프롬프트 생성에 실패했습니다");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 프롬프트 생성</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>프롬프트 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 감정 분석 프롬프트" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <VersionFormFields control={form.control} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "생성 중..." : "생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
