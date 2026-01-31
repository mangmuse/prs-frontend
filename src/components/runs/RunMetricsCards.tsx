import { Card } from "@/components/ui/card";
import { formatPercent } from "@/utils/format";

type Variant = "default" | "success" | "warning" | "danger";

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  variant?: Variant;
}

const VARIANT_STYLES: Record<Variant, string> = {
  default: "bg-white",
  success: "bg-green-50 border-green-200",
  warning: "bg-yellow-50 border-yellow-200",
  danger: "bg-red-50 border-red-200",
};

const getVariantByRate = (rate: number): Variant => {
  if (rate >= 90) return "success";
  if (rate >= 70) return "warning";
  return "danger";
};

export const RunMetricCard = ({
  label,
  value,
  suffix = "%",
  variant = "default",
}: MetricCardProps) => (
  <Card className={`p-4 ${VARIANT_STYLES[variant]}`}>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold">
      {typeof value === "number" ? value.toFixed(1) : value}
      {suffix && <span className="text-lg font-normal text-muted-foreground">{suffix}</span>}
    </p>
  </Card>
);

interface RunMetricsCardsProps {
  passRate: number;
  formatPassRate: number;
  semanticPassRate: number;
  logicPassRate: number;
  avgSemantic: number;
}

export const RunMetricsCards = ({
  passRate,
  formatPassRate,
  semanticPassRate,
  logicPassRate,
  avgSemantic,
}: RunMetricsCardsProps) => (
  <div className="grid grid-cols-5 gap-4">
    <RunMetricCard label="Pass Rate" value={passRate} variant={getVariantByRate(passRate)} />
    <RunMetricCard
      label="Format Pass"
      value={formatPassRate}
      variant={getVariantByRate(formatPassRate)}
    />
    <RunMetricCard
      label="Semantic Pass"
      value={semanticPassRate}
      variant={getVariantByRate(semanticPassRate)}
    />
    <RunMetricCard
      label="Logic Pass"
      value={logicPassRate}
      variant={getVariantByRate(logicPassRate)}
    />
    <RunMetricCard label="Avg Semantic" value={formatPercent(avgSemantic)} />
  </div>
);
