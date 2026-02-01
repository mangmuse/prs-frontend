export type RegressionCategory = "regressed" | "improved" | "changed" | "unchanged";
export type ResultStatus = "pass" | "format" | "semantic" | "logic";

export interface RowComparisonData {
  rowIndex: number;
  datasetRowId: number;
  baseStatus: ResultStatus;
  targetStatus: ResultStatus;
  baseSemanticScore: number;
  targetSemanticScore: number;
}

export interface RegressionComparisonResponse {
  pValue: number;
  rowComparisons: RowComparisonData[];
}

export interface RowChange {
  category: RegressionCategory;
  baseStatus: ResultStatus;
  targetStatus: ResultStatus;
}

export interface RegressionSummary {
  regressed: number;
  improved: number;
  changed: number;
  unchanged: number;
}
