import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDatasetWithRows } from "@/hooks/mutations/useCreateDatasetWithRows";

import { DatasetRowsTable } from "./DatasetRowsTable";
import { TemplateReferenceSection } from "./TemplateReferenceSection";
import { createDatasetSchema } from "./types";
import type { CreateDatasetFormData } from "./types";

interface CreateDatasetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateDatasetModal = ({ open, onOpenChange, onSuccess }: CreateDatasetModalProps) => {
  const createDatasetWithRows = useCreateDatasetWithRows();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<CreateDatasetFormData>({
    resolver: zodResolver(createDatasetSchema),
    defaultValues: {
      name: "",
      description: "",
      rows: [{ inputFields: [{ key: "input", value: "" }], expected: "", tags: "" }],
    },
    mode: "onChange",
  });

  const onSubmit = (data: CreateDatasetFormData) => {
    const validRows = data.rows
      .filter((row) => row.inputFields.some((f) => f.value.trim()))
      .map((row) => ({
        inputData: Object.fromEntries(
          row.inputFields
            .filter((f) => f.key && f.value.trim())
            .map((f) => [f.key, f.value.trim()]),
        ),
        expectedOutput: row.expected.trim(),
        tags: row.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }));

    createDatasetWithRows.mutate(
      {
        dataset: {
          name: data.name.trim(),
          description: data.description.trim() || undefined,
        },
        rows: validRows,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
          onSuccess();
        },
        onError: (error) => {
          console.error("Failed to create dataset:", error);
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

  const handleVariableClick = (variableName: string) => {
    const currentRows = getValues("rows");
    currentRows.forEach((row, index) => {
      const hasKey = row.inputFields.some((f) => f.key === variableName);
      if (!hasKey) {
        const emptyIndex = row.inputFields.findIndex((f) => !f.key || f.key === "input");
        if (emptyIndex >= 0) {
          setValue(`rows.${index}.inputFields.${emptyIndex}.key`, variableName);
        }
      }
    });
  };

  const isPending = createDatasetWithRows.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
          <DialogHeader>
            <DialogTitle>새 데이터셋</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataset-name">이름 *</Label>
                <Input
                  id="dataset-name"
                  {...register("name")}
                  placeholder="데이터셋 이름"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataset-desc">설명</Label>
                <Input id="dataset-desc" {...register("description")} placeholder="설명 (선택)" />
              </div>
            </div>

            <TemplateReferenceSection onVariableClick={handleVariableClick} />

            <DatasetRowsTable control={control} register={register} />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
