import type { Control, UseFormRegister } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { CreateDatasetFormData } from "./types";

interface InputFieldsCellProps {
  control: Control<CreateDatasetFormData>;
  rowIndex: number;
  register: UseFormRegister<CreateDatasetFormData>;
}

export const InputFieldsCell = ({ control, rowIndex, register }: InputFieldsCellProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `rows.${rowIndex}.inputFields`,
  });

  return (
    <div className="space-y-2 pt-1">
      {fields.map((field, fieldIndex) => (
        <div key={field.id} className="flex items-center gap-1">
          <Input
            {...register(`rows.${rowIndex}.inputFields.${fieldIndex}.key`)}
            placeholder="key"
            className="h-7 w-16 border-0 border-b bg-transparent px-1 font-mono text-xs focus-visible:ring-0"
          />
          <span className="text-muted-foreground">:</span>
          <Input
            {...register(`rows.${rowIndex}.inputFields.${fieldIndex}.value`)}
            placeholder="value"
            className="h-7 flex-1 text-xs"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            disabled={fields.length <= 1}
            onClick={() => remove(fieldIndex)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 text-xs text-muted-foreground"
        onClick={() => append({ key: "", value: "" })}
      >
        <Plus className="mr-1 h-3 w-3" />
        필드
      </Button>
    </div>
  );
};
