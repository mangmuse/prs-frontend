import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";

const editMetaSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력하세요"),
  description: z.string(),
});

type EditMetaFormData = z.infer<typeof editMetaSchema>;

interface EditMetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string }) => void;
  isPending: boolean;
  title: string;
  initialName: string;
  initialDescription: string;
}

export const EditMetaDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  title,
  initialName,
  initialDescription,
}: EditMetaDialogProps) => {
  const form = useForm<EditMetaFormData>({
    resolver: zodResolver(editMetaSchema),
    defaultValues: {
      name: initialName,
      description: initialDescription,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: initialName, description: initialDescription });
    }
  }, [open, initialName, initialDescription, form]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleSubmit = (data: EditMetaFormData) => {
    onSubmit({ name: data.name, description: data.description.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>이름과 설명을 수정할 수 있습니다.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isPending} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
