import type { Control, UseFormRegister } from "react-hook-form";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";

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
  return (
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
  );
};
