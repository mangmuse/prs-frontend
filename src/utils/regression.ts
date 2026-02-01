import type {
  RegressionCategory,
  RegressionSummary,
  ResultStatus,
  RowComparisonData,
} from "@/types/regression";

/**
 * 두 상태를 비교하여 회귀 카테고리 분류
 * - pass → fail: regressed
 * - fail → pass: improved
 * - same: unchanged
 * - different fail: changed
 */
export const classifyCategory = (
  baseStatus: ResultStatus,
  targetStatus: ResultStatus,
): RegressionCategory => {
  if (baseStatus === targetStatus) return "unchanged";
  if (baseStatus === "pass") return "regressed";
  if (targetStatus === "pass") return "improved";
  return "changed";
};

/**
 * row 비교 데이터로부터 summary 계산
 */
export const calculateSummary = (rowComparisons: RowComparisonData[]): RegressionSummary => {
  return rowComparisons.reduce(
    (acc, row) => {
      const category = classifyCategory(row.baseStatus, row.targetStatus);
      acc[category]++;
      return acc;
    },
    { regressed: 0, improved: 0, changed: 0, unchanged: 0 },
  );
};
