import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { datasetQueries } from "@/queries/datasetQueries";

interface DatasetSelectorProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export const DatasetSelector = ({ selectedId, onSelect }: DatasetSelectorProps) => {
  const { data: datasets, isPending } = useQuery(datasetQueries.list());

  const selectedDataset = datasets?.find((d) => d.id === selectedId);

  if (isPending) {
    return (
      <Button variant="outline" disabled className="w-[280px] justify-between">
        <span className="text-muted-foreground">로딩 중...</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (!datasets || datasets.length === 0) {
    return (
      <Button variant="outline" disabled className="w-[280px] justify-between">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Database className="h-4 w-4" />
          데이터셋을 생성하세요
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-between">
          {selectedDataset ? (
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {selectedDataset.name}
              <span className="text-muted-foreground">({selectedDataset.row_count} rows)</span>
            </span>
          ) : (
            <span className="text-muted-foreground">데이터셋 선택</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px]">
        {datasets.map((dataset) => (
          <DropdownMenuItem
            key={dataset.id}
            onClick={() => onSelect(dataset.id)}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {dataset.name}
              <span className="text-xs text-muted-foreground">({dataset.row_count} rows)</span>
            </span>
            <Check
              className={cn("h-4 w-4", selectedId === dataset.id ? "opacity-100" : "opacity-0")}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
