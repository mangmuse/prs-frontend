import type { ReactNode } from "react";

import { JsonViewer } from "@/components/runs/JsonViewer";

export const ScrollContent = ({ children }: { children: ReactNode }) => (
  <div className="max-h-[600px] overflow-y-auto pr-1">{children}</div>
);

export const PreContent = ({
  children,
  variant,
}: {
  children: string;
  variant: "blue" | "green";
}) => (
  <pre
    className={`whitespace-pre-wrap rounded-lg ${variant === "blue" ? "bg-blue-50" : "bg-green-50"} p-4 text-sm`}
  >
    {children}
  </pre>
);

export const JsonContent = ({ data }: { data: unknown }) => (
  <ScrollContent>
    <JsonViewer
      data={typeof data === "string" ? data : JSON.stringify(data, null, 2)}
      maxHeight="auto"
    />
  </ScrollContent>
);

ScrollContent.displayName = "ExpandableViewer.ScrollContent";
PreContent.displayName = "ExpandableViewer.PreContent";
JsonContent.displayName = "ExpandableViewer.JsonContent";
