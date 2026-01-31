import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import { profilesApi } from "@/api/profiles";
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
import { profileQueries } from "@/queries/profileQueries";
import type { ConstraintType } from "@/types/common";
import type { CreateProfileRequest, UpdateProfileRequest } from "@/types/profile";

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; profileId: number };

interface CreateProfileModalProps {
  state: ModalState;
  onClose: () => void;
  onSuccess?: () => void;
}

const CONSTRAINT_TYPES: { value: ConstraintType; label: string }[] = [
  { value: "contains", label: "포함 (contains)" },
  { value: "not_contains", label: "미포함 (not_contains)" },
  { value: "range", label: "범위 (range)" },
  { value: "regex", label: "정규식 (regex)" },
  { value: "max_length", label: "최대 길이 (max_length)" },
];

const constraintSchema = z.object({
  type: z.enum(["contains", "not_contains", "range", "regex", "max_length"]),
  target: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string().min(1, "프로필 이름을 입력하세요"),
  description: z.string().optional(),
  semantic_threshold: z.number().min(0).max(1),
  global_constraints: z.array(constraintSchema),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const CreateProfileModal = ({ state, onClose, onSuccess }: CreateProfileModalProps) => {
  const queryClient = useQueryClient();
  const isEditMode = state.open && state.mode === "edit";
  const profileId = isEditMode ? state.profileId : null;

  const { data: existingProfile } = useQuery({
    ...profileQueries.detail(profileId ?? 0),
    enabled: !!profileId,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      description: "",
      semantic_threshold: 0.85,
      global_constraints: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "global_constraints",
  });

  const watchedConstraints = useWatch({
    control: form.control,
    name: "global_constraints",
  });

  useEffect(() => {
    if (isEditMode && existingProfile) {
      form.reset({
        name: existingProfile.name,
        description: existingProfile.description || "",
        semantic_threshold: existingProfile.semantic_threshold,
        global_constraints: existingProfile.global_constraints,
      });
    } else if (!isEditMode && state.open) {
      form.reset({
        name: "",
        description: "",
        semantic_threshold: 0.85,
        global_constraints: [],
      });
    }
  }, [isEditMode, existingProfile, state.open, form]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProfileRequest) => profilesApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueries.all() });
      handleClose();
      onSuccess?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profilesApi.update(profileId!, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileQueries.all() });
      handleClose();
      onSuccess?.();
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: ProfileFormData) => {
    const requestData = {
      name: data.name,
      description: data.description || undefined,
      semantic_threshold: data.semantic_threshold,
      global_constraints: data.global_constraints.map((constraint) => ({
        type: constraint.type,
        target: constraint.target,
        ...(constraint.type === "contains" ||
        constraint.type === "not_contains" ||
        constraint.type === "regex"
          ? { value: constraint.value }
          : {}),
        ...(constraint.type === "range" ? { min: constraint.min, max: constraint.max } : {}),
      })),
    };

    if (isEditMode) {
      updateMutation.mutate(requestData);
    } else {
      createMutation.mutate(requestData as CreateProfileRequest);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "프로필 수정" : "새 프로필 생성"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>프로필 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 엄격한 평가, 관대한 평가" {...field} />
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
                    <Textarea placeholder="이 프로필의 용도를 설명하세요" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="semantic_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semantic Threshold: {Math.round(field.value * 100)}%</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(v: number[]) => field.onChange(v[0])}
                      min={0}
                      max={1}
                      step={0.05}
                      className="mt-2"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    AI 응답과 Expected의 의미적 유사도 합격선
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">Global Logic Constraints</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ type: "contains", target: "", value: "", min: 0, max: 1 })
                  }
                >
                  <Plus className="mr-1 h-4 w-4" />
                  제약조건 추가
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                모든 데이터셋 row에 공통 적용되는 제약조건
              </p>

              {fields.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  제약조건이 없습니다. 위 버튼을 눌러 추가하세요.
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2 rounded-lg border p-3">
                      <FormField
                        control={form.control}
                        name={`global_constraints.${index}.type`}
                        render={({ field: typeField }) => (
                          <FormItem className="w-40">
                            <Select value={typeField.value} onValueChange={typeField.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CONSTRAINT_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`global_constraints.${index}.target`}
                        render={({ field: targetField }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="대상 필드 (예: verdict)" {...targetField} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {(watchedConstraints?.[index]?.type === "contains" ||
                        watchedConstraints?.[index]?.type === "not_contains" ||
                        watchedConstraints?.[index]?.type === "regex") && (
                        <FormField
                          control={form.control}
                          name={`global_constraints.${index}.value`}
                          render={({ field: valueField }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="값" {...valueField} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}

                      {watchedConstraints?.[index]?.type === "range" && (
                        <>
                          <FormField
                            control={form.control}
                            name={`global_constraints.${index}.min`}
                            render={({ field: minField }) => (
                              <FormItem className="w-20">
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="min"
                                    {...minField}
                                    onChange={(e) => minField.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`global_constraints.${index}.max`}
                            render={({ field: maxField }) => (
                              <FormItem className="w-20">
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="max"
                                    {...maxField}
                                    onChange={(e) => maxField.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
      </DialogContent>
    </Dialog>
  );
};

export type { ModalState };
