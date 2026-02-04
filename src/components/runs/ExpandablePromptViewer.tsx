import { Label } from "@/components/ui/label";

import { ExpandableViewer } from "../common/ExpandableViewer";

interface ExpandablePromptViewerProps {
  systemInstruction: string;
  userTemplate: string;
  labelClassName: string;
}

export const ExpandablePromptViewer = ({
  systemInstruction,
  userTemplate,
  labelClassName,
}: ExpandablePromptViewerProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <Label className={labelClassName}>조립된 프롬프트</Label>
      <ExpandableViewer.TextTabs
        title="조립된 프롬프트"
        maxWidth="max-w-3xl"
        tabs={[
          {
            id: "system",
            label: "System Instruction",
            content: systemInstruction,
            variant: "blue",
          },
          { id: "user", label: "User Message", content: userTemplate, variant: "green" },
        ]}
        defaultTab="system"
      />
    </div>

    <div className="rounded-lg border">
      <div className="border-b bg-blue-50/50 p-2">
        <p className="text-xs font-medium text-blue-700">System</p>
        <p className="line-clamp-2 text-sm">{systemInstruction}</p>
      </div>
      <div className="bg-green-50/50 p-2">
        <p className="text-xs font-medium text-green-700">User</p>
        <p className="line-clamp-2 text-sm">{userTemplate}</p>
      </div>
    </div>
  </div>
);
