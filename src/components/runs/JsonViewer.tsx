import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { isJsonString, tryFormatJson } from "@/utils/json";

interface JsonViewerProps {
  data: string;
  maxHeight?: string;
}

export const JsonViewer = ({ data, maxHeight = "200px" }: JsonViewerProps) => {
  const { copied, copy } = useCopyToClipboard();

  const isJson = isJsonString(data);

  return (
    <div className="group relative rounded-lg border bg-muted/30">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => void copy(data)}
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="overflow-auto p-3 text-sm" style={{ maxHeight }}>
        <code className={isJson ? "text-blue-600" : ""}>{isJson ? tryFormatJson(data) : data}</code>
      </pre>
    </div>
  );
};
