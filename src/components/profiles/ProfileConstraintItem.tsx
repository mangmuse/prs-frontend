import { type Control, useWatch } from "react-hook-form";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONSTRAINT_TYPE_OPTIONS } from "@/constants/constraint";
import type { ConstraintType, LogicConstraint } from "@/types/constraint";
import { getDefaultConstraint } from "@/utils/constraintUtils";

import type { ProfileFormData } from "./profileSchema";

interface ProfileConstraintItemProps {
  control: Control<ProfileFormData>;
  index: number;
  onRemove: () => void;
  onTypeChange: (newConstraint: LogicConstraint) => void;
}

export const ProfileConstraintItem = ({
  control,
  index,
  onRemove,
  onTypeChange,
}: ProfileConstraintItemProps) => {
  const constraintType = useWatch({
    control,
    name: `globalConstraints.${index}.type`,
  });

  return (
    <div className="flex items-start gap-2 rounded-lg border p-3">
      <FormField
        control={control}
        name={`globalConstraints.${index}.type`}
        render={({ field }) => (
          <FormItem className="w-40">
            <Select
              value={field.value}
              onValueChange={(newType: ConstraintType) => {
                onTypeChange(getDefaultConstraint(newType));
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CONSTRAINT_TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {(constraintType === "contains" ||
        constraintType === "not_contains" ||
        constraintType === "regex" ||
        constraintType === "max_length") && (
        <FormField
          control={control}
          name={`globalConstraints.${index}.target` as const}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="대상 필드 (예: verdict)"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {constraintType === "range" && (
        <FormField
          control={control}
          name={`globalConstraints.${index}.target` as const}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="대상 필드 (필수)"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {(constraintType === "contains" || constraintType === "not_contains") && (
        <FormField
          control={control}
          name={`globalConstraints.${index}.value` as const}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="값" value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {constraintType === "regex" && (
        <FormField
          control={control}
          name={`globalConstraints.${index}.pattern` as const}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="정규식 패턴"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {constraintType === "range" && (
        <>
          <FormField
            control={control}
            name={`globalConstraints.${index}.min` as const}
            render={({ field }) => (
              <FormItem className="w-20">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="min"
                    value={(field.value as number) ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`globalConstraints.${index}.max` as const}
            render={({ field }) => (
              <FormItem className="w-20">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="max"
                    value={(field.value as number) ?? 1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </>
      )}

      {constraintType === "max_length" && (
        <FormField
          control={control}
          name={`globalConstraints.${index}.max` as const}
          render={({ field }) => (
            <FormItem className="w-24">
              <FormControl>
                <Input
                  type="number"
                  placeholder="최대 길이"
                  value={(field.value as number) ?? 100}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};
