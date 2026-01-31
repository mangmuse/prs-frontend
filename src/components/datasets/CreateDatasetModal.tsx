import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { ListFilter, Plus, Trash2, X } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateDatasetWithRows } from "@/hooks/mutations/useCreateDatasetWithRows";

import { ConstraintsEditor } from "./ConstraintsEditor";
import { InputFieldsCell } from "./InputFieldsCell";
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
  const [editingConstraintsIndex, setEditingConstraintsIndex] = useState<number | null>(null);

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
      rows: [
        { inputFields: [{ key: "input", value: "" }], expected: "", tags: "", constraints: [] },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
  });

  const rows = useWatch({
    control,
    name: "rows",
  });

  const onSubmit = (data: CreateDatasetFormData) => {
    const validRows = data.rows
      .filter((row) => row.inputFields.some((f) => f.value.trim()))
      .map((row) => ({
        input_data: Object.fromEntries(
          row.inputFields
            .filter((f) => f.key && f.value.trim())
            .map((f) => [f.key, f.value.trim()]),
        ),
        expected_output: row.expected.trim(),
        row_constraints: row.constraints.map((constraint) => ({
          type: constraint.type,
          value: constraint.value,
          target: constraint.target,
          min: constraint.min,
          max: constraint.max,
          pattern: constraint.pattern,
        })),
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
          setEditingConstraintsIndex(null);
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
      setEditingConstraintsIndex(null);
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

  const addRow = () => {
    append({ inputFields: [{ key: "input", value: "" }], expected: "", tags: "", constraints: [] });
  };

  const handleRemoveRow = (index: number) => {
    remove(index);
    if (editingConstraintsIndex === index) {
      setEditingConstraintsIndex(null);
    } else if (editingConstraintsIndex !== null && editingConstraintsIndex > index) {
      setEditingConstraintsIndex(editingConstraintsIndex - 1);
    }
  };

  const isPending = createDatasetWithRows.isPending;
  const editingRow = editingConstraintsIndex !== null ? rows[editingConstraintsIndex] : null;

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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>테스트 데이터</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <Plus className="mr-1 h-3 w-3" />행 추가
                </Button>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Input *</TableHead>
                      <TableHead className="w-28">Expected</TableHead>
                      <TableHead className="w-28">Tags</TableHead>
                      <TableHead className="w-32">Constraints</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="align-top">
                          <InputFieldsCell control={control} rowIndex={index} register={register} />
                        </TableCell>
                        <TableCell>
                          <Input
                            {...register(`rows.${index}.expected`)}
                            placeholder="기대값"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            {...register(`rows.${index}.tags`)}
                            placeholder="태그1,태그2"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() =>
                              setEditingConstraintsIndex(
                                editingConstraintsIndex === index ? null : index,
                              )
                            }
                          >
                            <ListFilter className="mr-1 h-3 w-3" />
                            {rows[index]?.constraints?.length ?? 0}개
                          </Button>
                        </TableCell>
                        <TableCell>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveRow(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {editingRow && editingConstraintsIndex !== null && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Row #{editingConstraintsIndex + 1} Logic Constraints
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setEditingConstraintsIndex(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Controller
                  name={`rows.${editingConstraintsIndex}.constraints`}
                  control={control}
                  render={({ field }) => (
                    <ConstraintsEditor constraints={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            )}
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
