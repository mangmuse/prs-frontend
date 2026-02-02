// TODO: Dataset rowConstraints 기능 삭제 후 이 컴포넌트 제거 예정
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
import type { ConstraintType, LogicConstraint } from "@/types/constraint";

// UI 내부용 타입 (동적 추가/삭제를 위한 id 포함)
type ConstraintWithId = LogicConstraint & { id: string };

interface ConstraintsEditorProps {
  constraints: ConstraintWithId[];
  onChange: (constraints: ConstraintWithId[]) => void;
}

const CONSTRAINT_TYPES: { value: ConstraintType; label: string }[] = [
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not Contains" },
  { value: "range", label: "Range" },
  { value: "regex", label: "Regex" },
  { value: "max_length", label: "Max Length" },
];

const createDefaultConstraint = (type: ConstraintType): ConstraintWithId => {
  const id = crypto.randomUUID();
  switch (type) {
    case "contains":
    case "not_contains":
      return { id, type, target: "", value: "" };
    case "range":
      return { id, type: "range", target: "", min: undefined, max: undefined };
    case "regex":
      return { id, type: "regex", target: "", pattern: "" };
    case "max_length":
      return { id, type: "max_length", target: "", max: 100 };
  }
};

export const ConstraintsEditor = ({ constraints, onChange }: ConstraintsEditorProps) => {
  const addConstraint = () => {
    onChange([...constraints, createDefaultConstraint("contains")]);
  };

  const removeConstraint = (id: string) => {
    onChange(constraints.filter((constraint) => constraint.id !== id));
  };

  const updateConstraint = (id: string, updated: ConstraintWithId) => {
    onChange(constraints.map((constraint) => (constraint.id === id ? updated : constraint)));
  };

  const changeConstraintType = (id: string, newType: ConstraintType) => {
    const newConstraint = createDefaultConstraint(newType);
    onChange(constraints.map((constraint) => (constraint.id === id ? newConstraint : constraint)));
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
        {constraints.map((constraint) => (
          <div
            key={constraint.id}
            className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3"
          >
            <div className="flex-1 space-y-2">
              <Select
                value={constraint.type}
                onValueChange={(value) =>
                  changeConstraintType(constraint.id, value as ConstraintType)
                }
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
                onChange={(updated) => updateConstraint(constraint.id, updated)}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={() => removeConstraint(constraint.id)}
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
  constraint: ConstraintWithId;
  onChange: (constraint: ConstraintWithId) => void;
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
            value={constraint.target ?? ""}
            onChange={(event) => onChange({ ...constraint, target: event.target.value })}
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
