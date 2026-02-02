import { useState } from "react";
import type { Control, UseFormRegister } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";

import { ListFilter, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";

import { ConstraintsEditor } from "./ConstraintsEditor";
import { InputFieldsCell } from "./InputFieldsCell";
import type { CreateDatasetFormData } from "./types";

interface DatasetRowItemProps {
  rowIndex: number;
  control: Control<CreateDatasetFormData>;
  register: UseFormRegister<CreateDatasetFormData>;
  onRemove: () => void;
  canRemove: boolean;
}

export const DatasetRowItem = ({
  rowIndex,
  control,
  register,
  onRemove,
  canRemove,
}: DatasetRowItemProps) => {
  const [isConstraintsExpanded, setIsConstraintsExpanded] = useState(false);

  const row = useWatch({
    control,
    name: `rows.${rowIndex}`,
  });

  const constraintsCount = row?.constraints?.length ?? 0;

  return (
    <>
      <TableRow>
        <TableCell className="text-muted-foreground">{rowIndex + 1}</TableCell>
        <TableCell className="align-top">
          <InputFieldsCell control={control} rowIndex={rowIndex} register={register} />
        </TableCell>
        <TableCell>
          <Input {...register(`rows.${rowIndex}.expected`)} placeholder="기대값" className="h-8" />
        </TableCell>
        <TableCell>
          <Input {...register(`rows.${rowIndex}.tags`)} placeholder="태그1,태그2" className="h-8" />
        </TableCell>
        <TableCell>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setIsConstraintsExpanded(!isConstraintsExpanded)}
          >
            <ListFilter className="mr-1 h-3 w-3" />
            {constraintsCount}개
          </Button>
        </TableCell>
        <TableCell>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </TableCell>
      </TableRow>

      {isConstraintsExpanded && (
        <TableRow>
          <TableCell colSpan={6} className="p-0">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 m-2">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium">Row #{rowIndex + 1} Logic Constraints</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsConstraintsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Controller
                name={`rows.${rowIndex}.constraints`}
                control={control}
                render={({ field }) => (
                  <ConstraintsEditor constraints={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
