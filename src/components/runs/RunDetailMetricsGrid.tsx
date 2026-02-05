import { Card } from "@/components/ui/card";
import type { MetricsAsPercent, MetricsDelta } from "@/types/runDetail";

export const RunDetailMetricsGrid = ({
  metricsAsPercent,
  metricsDelta,
}: {
  metricsAsPercent: MetricsAsPercent;
  metricsDelta?: MetricsDelta;
}) => {
  const formatDelta = (delta?: number) => {
    if (!delta) return null;
    const percent = (delta * 100).toFixed(0);
    if (delta > 0) return <span className="text-green-600">↑{percent}</span>;
    return <span className="text-red-600">↓{Math.abs(Number(percent))}</span>;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">통과율</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{metricsAsPercent.passRate.toFixed(1)}%</span>
          {formatDelta(metricsDelta?.passRate)}
        </div>
      </Card>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">출력형식 통과</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{metricsAsPercent.formatPassRate.toFixed(1)}%</span>
          {formatDelta(metricsDelta?.formatPassRate)}
        </div>
      </Card>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">유사도 통과</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {metricsAsPercent.semanticPassRate.toFixed(1)}%
          </span>
          {formatDelta(metricsDelta?.semanticPassRate)}
        </div>
      </Card>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">제약조건 통과</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {metricsAsPercent.constraintPassRate.toFixed(1)}%
          </span>
          {formatDelta(metricsDelta?.constraintPassRate)}
        </div>
      </Card>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">평균 유사도</p>
        <p className="text-2xl font-bold">{(metricsAsPercent.avgSemantic * 100).toFixed(1)}%</p>
      </Card>
    </div>
  );
};
