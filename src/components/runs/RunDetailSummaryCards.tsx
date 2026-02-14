import { Minus, RefreshCcw, TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { RegressionSummary } from "@/types/regression";
import type { StatusFilter } from "@/types/runDetail";

const CATEGORY_CONFIG = {
  regressed: {
    label: "회귀",
    color: "bg-red-50 hover:bg-red-100 border-red-200 text-red-700",
    icon: TrendingDown,
  },
  improved: {
    label: "개선",
    color: "bg-green-50 hover:bg-green-100 border-green-200 text-green-700",
    icon: TrendingUp,
  },
  changed: {
    label: "변경",
    color: "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700",
    icon: RefreshCcw,
  },
  unchanged: {
    label: "유지",
    color: "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600",
    icon: Minus,
  },
};

export const RunDetailSummaryCards = ({
  summary,
  statusFilter,
  onStatusFilterChange,
}: {
  summary?: RegressionSummary;
  statusFilter: StatusFilter;
  onStatusFilterChange: (next: StatusFilter) => void;
}) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {(Object.entries(summary) as [keyof typeof CATEGORY_CONFIG, number][]).map(
        ([category, count]) => {
          const config = CATEGORY_CONFIG[category];
          return (
            <Card
              key={category}
              className={`cursor-pointer border p-4 transition-all hover:shadow-sm ${config.color} ${
                statusFilter === category ? "ring-2 ring-offset-1 ring-current" : ""
              }`}
              onClick={() => onStatusFilterChange(statusFilter === category ? "all" : category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-white/60 p-1.5">
                    <config.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <span className="text-2xl font-bold">{count}</span>
              </div>
            </Card>
          );
        },
      )}
    </div>
  );
};
