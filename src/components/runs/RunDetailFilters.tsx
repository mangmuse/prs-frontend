import { Button } from "@/components/ui/button";
import type { RegressionSummary } from "@/types/regression";
import type { StatusFilter } from "@/types/runDetail";

export const RunDetailFilters = ({
  statusFilter,
  totalCount,
  passCount,
  failCount,
  isCompareMode,
  summary,
  onStatusFilterChange,
}: {
  statusFilter: StatusFilter;
  totalCount: number;
  passCount: number;
  failCount: number;
  isCompareMode: boolean;
  summary?: RegressionSummary;
  onStatusFilterChange: (next: StatusFilter) => void;
}) => (
  <div className="mb-4 flex flex-wrap gap-2">
    <Button
      size="sm"
      variant={statusFilter === "all" ? "default" : "outline"}
      onClick={() => onStatusFilterChange("all")}
    >
      전체 ({totalCount})
    </Button>
    <Button
      size="sm"
      variant={statusFilter === "pass" ? "default" : "outline"}
      onClick={() => onStatusFilterChange("pass")}
    >
      통과 ({passCount})
    </Button>
    <Button
      size="sm"
      variant={statusFilter === "fail" ? "default" : "outline"}
      onClick={() => onStatusFilterChange("fail")}
    >
      실패 ({failCount})
    </Button>
    {isCompareMode && summary && (
      <>
        <Button
          size="sm"
          variant={statusFilter === "regressed" ? "default" : "outline"}
          className={statusFilter !== "regressed" ? "border-red-200 text-red-600" : ""}
          onClick={() => onStatusFilterChange("regressed")}
        >
          회귀 ({summary.regressed})
        </Button>
        <Button
          size="sm"
          variant={statusFilter === "improved" ? "default" : "outline"}
          className={statusFilter !== "improved" ? "border-green-200 text-green-600" : ""}
          onClick={() => onStatusFilterChange("improved")}
        >
          개선 ({summary.improved})
        </Button>
      </>
    )}
  </div>
);
