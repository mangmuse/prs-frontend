import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { promptQueries } from "@/queries/promptQueries";
import { extractTemplateVariables } from "@/utils/templateUtils";

interface TemplateReferenceSectionProps {
  onVariableClick: (variableName: string) => void;
}

export const TemplateReferenceSection = ({ onVariableClick }: TemplateReferenceSectionProps) => {
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

  const { data: prompts = [], isPending: isPromptsLoading } = useQuery(promptQueries.list());

  const { data: versions = [], isPending: isVersionsLoading } = useQuery({
    ...promptQueries.versions(selectedPromptId!),
    enabled: !!selectedPromptId,
  });

  const selectedVersion = versions.find((v) => v.id === selectedVersionId);
  const variables = selectedVersion ? extractTemplateVariables(selectedVersion.userTemplate) : [];

  const handlePromptChange = (promptId: number | null) => {
    setSelectedPromptId(promptId);
    setSelectedVersionId(null);
  };

  const handleVersionChange = (versionId: number | null) => {
    setSelectedVersionId(versionId);
  };

  return (
    <div className="rounded-lg border border-dashed p-3 space-y-3">
      <Label className="text-sm text-muted-foreground">Template 참조 (선택)</Label>

      <div className="grid grid-cols-2 gap-2">
        <Select
          value={selectedPromptId?.toString() ?? ""}
          onValueChange={(v) => handlePromptChange(v ? Number(v) : null)}
          disabled={isPromptsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isPromptsLoading ? "로딩 중..." : "Prompt 선택..."} />
          </SelectTrigger>
          <SelectContent>
            {prompts.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedVersionId?.toString() ?? ""}
          onValueChange={(v) => handleVersionChange(v ? Number(v) : null)}
          disabled={!selectedPromptId || isVersionsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isVersionsLoading ? "로딩 중..." : "Version 선택..."} />
          </SelectTrigger>
          <SelectContent>
            {versions.map((v) => (
              <SelectItem key={v.id} value={v.id.toString()}>
                v{v.versionNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {variables.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="mb-2 text-sm text-muted-foreground">💡 이 Template의 변수:</p>
          <div className="flex flex-wrap gap-1">
            {variables.map((varName) => (
              <Badge
                key={varName}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => onVariableClick(varName)}
              >
                {varName}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
