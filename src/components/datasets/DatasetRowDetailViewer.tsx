import { ExpandableViewer } from "@/components/common/ExpandableViewer";
import { JsonViewer } from "@/components/runs/JsonViewer";
import type { DatasetRow } from "@/types/dataset";

interface DatasetRowDetailViewerProps {
  row: DatasetRow;
  defaultTab: "input" | "expected";
  trigger: React.ReactNode;
}

export const DatasetRowDetailViewer = ({
  row,
  defaultTab,
  trigger,
}: DatasetRowDetailViewerProps) => (
  <ExpandableViewer.Root title="데이터셋 상세" maxWidth="max-w-3xl" trigger={trigger}>
    <ExpandableViewer.Tabs defaultTab={defaultTab}>
      <ExpandableViewer.Tab id="input" label="입력 데이터">
        <ExpandableViewer.ScrollContent>
          <div className="space-y-4">
            {Object.entries(row.inputData).map(([key, value]) => (
              <div key={key} className="space-y-1.5">
                <h4 className="text-sm font-medium text-muted-foreground">{key}</h4>
                <JsonViewer
                  data={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
                  maxHeight="auto"
                />
              </div>
            ))}
          </div>
        </ExpandableViewer.ScrollContent>
      </ExpandableViewer.Tab>
      <ExpandableViewer.Tab id="expected" label="기대 출력">
        <ExpandableViewer.JsonContent data={row.expectedOutput} />
      </ExpandableViewer.Tab>
    </ExpandableViewer.Tabs>
  </ExpandableViewer.Root>
);
