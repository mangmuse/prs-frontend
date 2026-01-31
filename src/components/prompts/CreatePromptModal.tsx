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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePrompt } from "@/hooks/mutations/useCreatePrompt";
import { useCreateVersion } from "@/hooks/mutations/useCreateVersion";
import type { CreateVersionRequest, OutputSchemaType } from "@/types/prompt";

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "version"; promptId: number };

interface CreatePromptModalProps {
  state: ModalState;
  onClose: () => void;
  onSuccess?: () => void;
}

const MODEL_OPTIONS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"] as const;

const SCHEMA_OPTIONS = ["JSON Object", "JSON Array", "Label", "Freeform"] as const;

const createPromptSchema = z.object({
  name: z.string().min(1, "프롬프트 이름을 입력하세요"),
});

const createVersionSchema = z.object({
  systemInstruction: z.string(),
  userTemplate: z.string(),
  model: z.string(),
  temperature: z.number().min(0).max(2),
  outputSchema: z.enum(SCHEMA_OPTIONS),
  memo: z.string().optional(),
});

type CreatePromptFormData = z.infer<typeof createPromptSchema>;
type CreateVersionFormData = z.infer<typeof createVersionSchema>;

export const CreatePromptModal = ({ state, onClose, onSuccess }: CreatePromptModalProps) => {
  const isVersionMode = state.open && state.mode === "version";

  const promptForm = useForm<CreatePromptFormData>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: { name: "" },
  });

  const versionForm = useForm<CreateVersionFormData>({
    resolver: zodResolver(createVersionSchema),
    defaultValues: {
      systemInstruction: "",
      userTemplate: "",
      model: "gemini-2.5-flash",
      temperature: 1.0,
      outputSchema: "JSON Object",
      memo: "",
    },
  });

  const createPromptMutation = useCreatePrompt();
  const createVersionMutation = useCreateVersion();

  const handleClose = () => {
    promptForm.reset();
    versionForm.reset();
    onClose();
  };

  const onPromptSubmit = (data: CreatePromptFormData) => {
    createPromptMutation.mutate(
      { name: data.name },
      {
        onSuccess: () => {
          handleClose();
          onSuccess?.();
        },
      },
    );
  };

  const onVersionSubmit = (data: CreateVersionFormData) => {
    if (!state.open || state.mode !== "version") return;
    const requestData: CreateVersionRequest = {
      systemInstruction: data.systemInstruction,
      userTemplate: data.userTemplate,
      model: data.model,
      temperature: data.temperature,
      outputSchema: data.outputSchema as OutputSchemaType,
      memo: data.memo || undefined,
    };
    createVersionMutation.mutate(
      {
        promptId: state.promptId,
        data: requestData,
      },
      {
        onSuccess: () => {
          handleClose();
          onSuccess?.();
        },
      },
    );
  };

  const isLoading = createPromptMutation.isPending || createVersionMutation.isPending;

  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isVersionMode ? "새 버전 생성" : "새 프롬프트 생성"}</DialogTitle>
        </DialogHeader>

        {!isVersionMode ? (
          <Form {...promptForm}>
            <form
              onSubmit={(e) => void promptForm.handleSubmit(onPromptSubmit)(e)}
              className="space-y-4 py-4"
            >
              <FormField
                control={promptForm.control}
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "저장 중..." : "저장"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...versionForm}>
            <form
              onSubmit={(e) => void versionForm.handleSubmit(onVersionSubmit)(e)}
              className="space-y-4 py-4"
            >
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={versionForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>모델</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MODEL_OPTIONS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={versionForm.control}
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
                  control={versionForm.control}
                  name="outputSchema"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Output Schema</FormLabel>
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
                control={versionForm.control}
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
                control={versionForm.control}
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
                control={versionForm.control}
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "저장 중..." : "저장"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export type { ModalState };
