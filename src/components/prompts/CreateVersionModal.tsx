import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { SCHEMA_OPTIONS } from "@/constants/prompt";
import { useCreateVersion } from "@/hooks/mutations/useCreateVersion";
import { llmQueries } from "@/queries/llmQueries";
import type { CreateVersionRequest, OutputSchemaType } from "@/types/prompt";

interface CreateVersionModalProps {
  open: boolean;
  promptId: number;
  onClose: () => void;
}

const createVersionSchema = z.object({
  systemInstruction: z.string(),
  userTemplate: z.string(),
  model: z.string().min(1, "모델을 선택해주세요"),
  temperature: z.number().min(0).max(2),
  outputSchema: z.enum(SCHEMA_OPTIONS),
  memo: z.string().optional(),
});

type CreateVersionFormData = z.infer<typeof createVersionSchema>;

export const CreateVersionModal = ({ open, promptId, onClose }: CreateVersionModalProps) => {
  const { data: modelsData, isPending: modelsLoading } = useQuery(llmQueries.models());
  const models = modelsData?.models ?? [];

  const form = useForm<CreateVersionFormData>({
    resolver: zodResolver(createVersionSchema),
    defaultValues: {
      systemInstruction: "",
      userTemplate: "",
      model: "",
      temperature: 1.0,
      outputSchema: "JSON Object",
      memo: "",
    },
  });

  const createVersionMutation = useCreateVersion();

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: CreateVersionFormData) => {
    const requestData: CreateVersionRequest = {
      systemInstruction: data.systemInstruction,
      userTemplate: data.userTemplate,
      model: data.model,
      temperature: data.temperature,
      outputSchema: data.outputSchema as OutputSchemaType,
      memo: data.memo || undefined,
    };

    createVersionMutation.mutate({ promptId, data: requestData }, { onSuccess: handleClose });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 버전 생성</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>모델</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={modelsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="모델을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-96 overflow-y-auto">
                        {models.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature ({field.value})</FormLabel>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        onValueChange={(v: number[]) => field.onChange(v[0])}
                        min={0}
                        max={1}
                        step={0.1}
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outputSchema"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>출력 형식</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SCHEMA_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="systemInstruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Instruction</FormLabel>
                  <FormControl>
                    <Textarea placeholder="시스템 지시사항을 입력하세요..." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Template</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="사용자 템플릿을 입력하세요. {{변수}} 형태로 플레이스홀더 사용"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메모 (변경사항)</FormLabel>
                  <FormControl>
                    <Input placeholder="이 버전의 변경사항" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
