import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isJsonString, tryFormatJson } from "@/utils/json";

interface InputPreviewProps {
  input: Record<string, string>;
}

const FormattedValue = ({ value }: { value: string }) => {
  if (isJsonString(value)) {
    return (
      <pre className="whitespace-pre-wrap rounded-md border bg-slate-50 p-2 font-mono text-xs text-slate-700">
        {tryFormatJson(value)}
      </pre>
    );
  }
  return <p className="rounded-md bg-muted/50 p-2 text-sm">{value}</p>;
};

export const InputPreview = ({ input }: InputPreviewProps) => {
  const entries = Object.entries(input);
  if (entries.length === 0) return <span>-</span>;

  const [firstKey, firstValue] = entries[0];
  const truncatedValue = firstValue.length > 30 ? `${firstValue.slice(0, 30)}...` : firstValue;

  return (
    <div className="flex items-center gap-2">
      <div className="flex max-w-60 items-center gap-1.5 rounded-md border bg-muted/30 px-2 py-1 text-xs">
        <span className="font-semibold text-muted-foreground">{firstKey}:</span>
        <span className="truncate">{truncatedValue}</span>
      </div>

      {entries.length > 1 && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="cursor-help rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              +{entries.length - 1}
            </span>
          </HoverCardTrigger>
          <HoverCardContent className="w-96 p-0" align="start">
            <ScrollArea className="max-h-96">
              <div className="space-y-3 p-4">
                {entries.map(([key, value]) => (
                  <div key={key}>
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                      {key}
                    </span>
                    <FormattedValue value={value} />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
};
