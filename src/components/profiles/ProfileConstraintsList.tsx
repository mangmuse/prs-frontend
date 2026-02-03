import type { Control } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProfileConstraintItem } from "./ProfileConstraintItem";
import type { ProfileFormData } from "./profileSchema";

interface ProfileConstraintsListProps {
  control: Control<ProfileFormData>;
}

export const ProfileConstraintsList = ({ control }: ProfileConstraintsListProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "globalConstraints",
  });

  const handleAddConstraint = () => {
    append({ type: "contains", value: "", target: "" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none">제약조건</label>
        <Button type="button" variant="outline" size="sm" onClick={handleAddConstraint}>
          <Plus className="mr-1 h-4 w-4" />
          제약조건 추가
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">모든 데이터셋 row에 공통 적용되는 제약조건</p>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          제약조건이 없습니다. 위 버튼을 눌러 추가하세요.
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <ProfileConstraintItem
              key={field.id}
              control={control}
              index={index}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
