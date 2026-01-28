import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { ListFilter, Plus, Trash2, X } from "lucide-react";
import { z } from "zod";

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

const constraintSchema = z.object({
  type: z.enum(["contains", "not_contains", "range", "regex", "max_length"]),
  value: z.union([z.string(), z.number()]).optional(),
  field: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
});

const rowSchema = z.object({
  input: z.string(),
  expected: z.string(),
  tags: z.string(),
  constraints: z.array(constraintSchema),
});

const createDatasetSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다"),
  description: z.string(),
  rows: z.array(rowSchema).min(1),
});

type CreateDatasetFormData = z.infer<typeof createDatasetSchema>;

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
    formState: { errors, isValid },
  } = useForm<CreateDatasetFormData>({
    resolver: zodResolver(createDatasetSchema),
    defaultValues: {
      name: "",
      description: "",
      rows: [{ input: "", expected: "", tags: "", constraints: [] }],
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
      .filter((row) => row.input.trim())
      .map((row) => ({
        input_data: { text: row.input.trim() },
        expected_output: row.expected.trim(),
        row_constraints: row.constraints,
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

  const addRow = () => {
    append({ input: "", expected: "", tags: "", constraints: [] });
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
                        <TableCell>
                          <Input
                            {...register(`rows.${index}.input`)}
                            placeholder="입력 텍스트"
                            className="h-8"
                          />
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
