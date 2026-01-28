import { Controller, useFieldArray, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddRows } from "@/hooks/mutations/useAddRows";

import { ConstraintsEditor } from "./ConstraintsEditor";

const inputFieldSchema = z.object({
  key: z.string().min(1, "키는 필수입니다"),
  value: z.string(),
});

const constraintSchema = z.object({
  type: z.enum(["contains", "not_contains", "range", "regex", "max_length"]),
  value: z.union([z.string(), z.number()]).optional(),
  field: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
});

const datasetRowSchema = z.object({
  inputFields: z.array(inputFieldSchema).min(1, "최소 1개의 입력 필드가 필요합니다"),
  expectedOutput: z.string().min(1, "Expected output은 필수입니다"),
  tags: z.string(),
  constraints: z.array(constraintSchema),
});

type DatasetRowFormData = z.infer<typeof datasetRowSchema>;

interface DatasetRowFormProps {
  datasetId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DatasetRowForm = ({ datasetId, open, onOpenChange }: DatasetRowFormProps) => {
  const addRows = useAddRows();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<DatasetRowFormData>({
    resolver: zodResolver(datasetRowSchema),
    defaultValues: {
      inputFields: [{ key: "input", value: "" }],
      expectedOutput: "",
      tags: "",
      constraints: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "inputFields",
  });

  const onSubmit = (data: DatasetRowFormData) => {
    const inputData = Object.fromEntries(data.inputFields.map((field) => [field.key, field.value]));

    const tags = data.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    addRows.mutate(
      {
        datasetId,
        rows: [
          {
            input_data: inputData,
            expected_output: data.expectedOutput,
            row_constraints: data.constraints,
            tags,
          },
        ],
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
        onError: (error) => {
          console.error("Failed to add row:", error);
        },
      },
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
          <DialogHeader>
            <DialogTitle>새 행 추가</DialogTitle>
            <DialogDescription>데이터셋에 새 테스트 케이스를 추가합니다.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Input *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => append({ key: "", value: "" })}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  필드 추가
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="key"
                        className="font-mono text-sm"
                        {...register(`inputFields.${index}.key`)}
                        aria-invalid={!!errors.inputFields?.[index]?.key}
                      />
                      {errors.inputFields?.[index]?.key && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.inputFields[index].key?.message}
                        </p>
                      )}
                    </div>
                    <div className="flex-2">
                      <Input
                        placeholder="value"
                        className="text-sm"
                        {...register(`inputFields.${index}.value`)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>

              {errors.inputFields?.root && (
                <p className="text-sm text-destructive">{errors.inputFields.root.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expectedOutput">Expected Output *</Label>
              <Textarea
                id="expectedOutput"
                placeholder='TRUE, FALSE, {"verdict": "..."} 등'
                rows={2}
                className="font-mono text-sm"
                {...register("expectedOutput")}
                aria-invalid={!!errors.expectedOutput}
              />
              {errors.expectedOutput && (
                <p className="text-sm text-destructive">{errors.expectedOutput.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (쉼표로 구분)</Label>
              <Input id="tags" placeholder="edge-case, korean, important" {...register("tags")} />
            </div>

            <Controller
              name="constraints"
              control={control}
              render={({ field }) => (
                <ConstraintsEditor constraints={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={addRows.isPending}>
              {addRows.isPending ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
