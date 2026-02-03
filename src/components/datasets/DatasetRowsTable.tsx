import type { Control, UseFormRegister } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { DatasetRowItem } from "./DatasetRowItem";
import type { CreateDatasetFormData } from "./types";

interface DatasetRowsTableProps {
  control: Control<CreateDatasetFormData>;
  register: UseFormRegister<CreateDatasetFormData>;
}

export const DatasetRowsTable = ({ control, register }: DatasetRowsTableProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
  });

  const addRow = () => {
    append({
      inputFields: [{ key: "input", value: "" }],
      expected: "",
      tags: "",
    });
  };

  return (
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
              <TableHead>입력값 *</TableHead>
              <TableHead className="w-28">기대값</TableHead>
              <TableHead className="w-28">태그</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <DatasetRowItem
                key={field.id}
                rowIndex={index}
                control={control}
                register={register}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
