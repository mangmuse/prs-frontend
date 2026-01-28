import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConstraintType, LogicConstraint } from "@/types/dataset";

interface ConstraintsEditorProps {
  constraints: LogicConstraint[];
  onChange: (constraints: LogicConstraint[]) => void;
}

const CONSTRAINT_TYPES: { value: ConstraintType; label: string }[] = [
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not Contains" },
  { value: "range", label: "Range" },
  { value: "regex", label: "Regex" },
  { value: "max_length", label: "Max Length" },
];

const createDefaultConstraint = (type: ConstraintType): LogicConstraint => {
  switch (type) {
    case "contains":
    case "not_contains":
      return { type, value: "" };
    case "range":
      return { type: "range", field: "", min: undefined, max: undefined };
    case "regex":
      return { type: "regex", pattern: "" };
    case "max_length":
      return { type: "max_length", max: 100 };
  }
};

export const ConstraintsEditor = ({ constraints, onChange }: ConstraintsEditorProps) => {
  const addConstraint = () => {
    onChange([...constraints, createDefaultConstraint("contains")]);
  };

  const removeConstraint = (index: number) => {
    onChange(constraints.filter((_, existingIndex) => existingIndex !== index));
  };

  const updateConstraint = (index: number, updated: LogicConstraint) => {
    onChange(
      constraints.map((existingConstraint, existingIndex) =>
        existingIndex === index ? updated : existingConstraint,
      ),
    );
  };

  const changeConstraintType = (index: number, newType: ConstraintType) => {
    updateConstraint(index, createDefaultConstraint(newType));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>제약조건</Label>
        <Button type="button" variant="outline" size="sm" onClick={addConstraint}>
          <Plus className="mr-1 h-3 w-3" />
          추가
        </Button>
      </div>

      {constraints.length === 0 && (
        <p className="text-sm text-muted-foreground">제약조건이 없습니다.</p>
      )}

      <div className="space-y-3">
        {constraints.map((constraint, index) => (
          <div key={index} className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex-1 space-y-2">
              <Select
                value={constraint.type}
                onValueChange={(value) => changeConstraintType(index, value as ConstraintType)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONSTRAINT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ConstraintFields
                constraint={constraint}
                onChange={(updated) => updateConstraint(index, updated)}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={() => removeConstraint(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ConstraintFieldsProps {
  constraint: LogicConstraint;
  onChange: (constraint: LogicConstraint) => void;
}

const ConstraintFields = ({ constraint, onChange }: ConstraintFieldsProps) => {
  switch (constraint.type) {
    case "contains":
    case "not_contains":
      return (
        <Input
          placeholder="검색할 문자열"
          value={constraint.value ?? ""}
          onChange={(event) => onChange({ ...constraint, value: event.target.value })}
        />
      );

    case "range":
      return (
        <div className="flex gap-2">
          <Input
            placeholder="필드명"
            value={constraint.field ?? ""}
            onChange={(event) => onChange({ ...constraint, field: event.target.value })}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="최소"
            value={constraint.min ?? ""}
            onChange={(event) =>
              onChange({
                ...constraint,
                min: event.target.value ? Number(event.target.value) : undefined,
              })
            }
            className="w-20"
          />
          <Input
            type="number"
            placeholder="최대"
            value={constraint.max ?? ""}
            onChange={(event) =>
              onChange({
                ...constraint,
                max: event.target.value ? Number(event.target.value) : undefined,
              })
            }
            className="w-20"
          />
        </div>
      );

    case "regex":
      return (
        <Input
          placeholder="정규식 패턴"
          value={constraint.pattern ?? ""}
          onChange={(event) => onChange({ ...constraint, pattern: event.target.value })}
        />
      );

    case "max_length":
      return (
        <Input
          type="number"
          placeholder="최대 길이"
          value={constraint.max ?? ""}
          onChange={(event) =>
            onChange({
              ...constraint,
              max: event.target.value ? Number(event.target.value) : undefined,
            })
          }
          className="w-32"
        />
      );
  }
};
