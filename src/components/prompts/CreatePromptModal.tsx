import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { useCreatePrompt } from "@/hooks/mutations/useCreatePrompt";

interface CreatePromptModalProps {
  open: boolean;
  onClose: () => void;
}

const createPromptSchema = z.object({
  name: z.string().min(1, "프롬프트 이름을 입력하세요"),
});

type CreatePromptFormData = z.infer<typeof createPromptSchema>;

export const CreatePromptModal = ({ open, onClose }: CreatePromptModalProps) => {
  const form = useForm<CreatePromptFormData>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: { name: "" },
  });

  const createPromptMutation = useCreatePrompt();

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: CreatePromptFormData) => {
    createPromptMutation.mutate({ name: data.name }, { onSuccess: handleClose });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md">
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button type="submit" disabled={createPromptMutation.isPending}>
                {createPromptMutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
