import { Label } from "@/components/ui/label";

import { ExpandableViewer } from "../common/ExpandableViewer";

interface ExpandablePromptViewerProps {
  systemInstruction: string;
  userTemplate: string;
}

export const ExpandablePromptViewer = ({
  systemInstruction,
  userTemplate,
}: ExpandablePromptViewerProps) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium">조립된 프롬프트</Label>
      <ExpandableViewer title="조립된 프롬프트" maxWidth="max-w-3xl">
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">System Instruction</Label>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-blue-50 p-4 text-sm">
              {systemInstruction}
            </pre>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">User Message</Label>
            <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-green-50 p-4 text-sm">
              {userTemplate}
            </pre>
          </div>
        </div>
      </ExpandableViewer>
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
